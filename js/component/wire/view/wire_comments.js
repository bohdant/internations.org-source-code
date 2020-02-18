import $ from 'jquery'
import 'vendor/bootstrap-dropdown'
import _ from 'lodash'
import View from 'view/view'
import dispatcher from 'service/event_dispatcher'
import analytics from 'service/google_analytics'
import io from 'service/io'
import DeleteEntryModalView from 'view/delete_entry_modal'
import stickyFlashMessage from 'shared/view/sticky_flash_message'

const WireCommentsView = View.extend({
    templates: {
        moreComments: _.template(
            '<span class="js-remaining-comments-count">' +
                '<%= count %></span> more comment<% if (count > 1) { %>s<% } %>'
        ),
    },

    events: {
        'click .js-show-comments': '_onShowCommentsClick',
        'focus .js-new-comment-form textarea': '_onCommentTextareaFocus',
        'click .js-show-form-button': '_onShowFormButtonClick',
        'click .js-comment-cancel': '_onCommentCancelClick',
        'click .js-show-more-comments': '_onShowMoreCommentsClick',
        'submit .js-new-comment-form': '_onNewCommentFormSubmit',
        'click .js-delete-comment-trigger': '_onDeleteCommentClick',
        'click .js-comment-submit-button': '_onCommentSubmitButtonClick',
    },

    /**
     * Uncollapse the comments wrapper. Used when the entry has no comments
     * and the user wants to add a new comment.
     */
    _onShowCommentsClick(e) {
        const $target = $(e.target)
        const $entry = $target.closest('.js-entry-container')
        const $commentsWrapper = $entry.find('.js-entry-comments').first()
        const $newCommentForm = $commentsWrapper.find('.js-new-comment-form').first()

        $commentsWrapper.removeClass('is-hidden')
        $newCommentForm.find('textarea').focus()
    },

    _onShowFormButtonClick(e) {
        const $form = this._getClosestCommentForm(e.target)

        this._expandForm($form, true)

        $form.find('.js-new-comment-form-textarea').focus()
    },

    _onCommentCancelClick(e) {
        this._expandForm(this._getClosestCommentForm(e.target), false)
    },

    // Expand the new comment form when the textarea is focused.
    _onCommentTextareaFocus(e) {
        this._expandForm(this._getClosestCommentForm(e.target), true)
    },

    /**
     * Get closest commenting form to element
     *
     * @param  {jQuery|HTMLElement} element Target element we are going to find closest commenting form to
     * @return {jQuery}  Closest commenting form
     */
    _getClosestCommentForm(element) {
        return $(element).closest('.js-new-comment-form')
    },

    /**
     * Expand commenting form
     * @param {jQuery}  $form Form we are expanding
     * @param {Boolean} state State:
     *                          - true: expand comment form
     *                          - false: collapse comment form
     */
    _expandForm($form, state) {
        return $form.toggleClass('is-collapsed', !state)
    },

    _onShowMoreCommentsClick(e) {
        const $target = $(e.target)
        const $targetParent = $($target.parent())
        const url = $target.attr('href')
        const currentCount = Number($target.find('.js-remaining-comments-count').text())

        e.preventDefault()

        if ($target.hasClass('is-loading')) {
            return
        }

        const targetOriginalHTML = $target.html()
        $target.addClass('is-loading').html('')

        this.fetchComments(url).then(response => {
            $target.removeClass('is-loading')

            if (!response || response.content === undefined) {
                return
            }

            // Handle server errors which return the entire thread's HTML rather than an array of comments
            if (typeof response.content.join !== 'function') {
                stickyFlashMessage.show(
                    'Sorry, an error occurred while sending the request. Please reload the page and try again.',
                    { type: 'error' }
                )

                $target.html(targetOriginalHTML)

                return
            }

            $targetParent.after(response.content.join(''))
            dispatcher.dispatch('redraw', $targetParent[0].parentNode)

            // hide or swap url of show more button
            if (response.nextUrl) {
                $target.attr('href', response.nextUrl)
                this.updateCommentCount($target, currentCount - response.content.length)
            } else {
                $target.parent().remove()
            }
        })
    },

    /**
     * Asynchronously fetch new comments from the server.
     * Returns a Promise that passes the response as argument to all callbacks
     * after it's resolved
     */
    fetchComments(url) {
        return io.request(url, {
            dataType: 'json',
        })
    },

    /**
     * Updates the 'remaining comments to load' count
     */
    updateCommentCount($showMore, remaining) {
        $showMore.html(this.templates.moreComments({ count: remaining }))
    },

    /**
     * Click on comment submit button. Real comment addition logic is handled by form:submit
     */
    _onCommentSubmitButtonClick() {
        analytics.trackEvent('start_page', 'click_comment_wire')
    },

    _onNewCommentFormSubmit(e) {
        const $newCommentForm = $(e.target)
        const $commentsContainer = $newCommentForm.closest('.js-entry-comments')
        const $newCommentButton = $newCommentForm.find('.js-comment-submit-button')
        const url = $newCommentForm.attr('action')
        let data = ''

        e.preventDefault()
        data = $newCommentForm.serialize()

        // Notice: submit button is also disabled by form validation code (manager)
        $newCommentButton.prop('disabled', true)

        this.persistComment(url, data).then(
            response => {
                $newCommentButton.prop('disabled', false)

                if (!response.content) {
                    return
                }

                this.createNewComment($commentsContainer, response.content.entry)
                $newCommentForm.replaceWith(response.content.form)
                dispatcher.dispatch('redraw', $commentsContainer[0])
            },
            () => {
                // TODO INDEV-4066 Handle case where the server response reports an error
                $newCommentButton.prop('disabled', false)
            }
        )
    },

    createNewComment($commentsContainer, commentContent) {
        const $commentsList = $commentsContainer.find('.js-comments-list')

        // list is never empty after this
        $commentsList.removeClass('is-empty')
        $commentsList.append(commentContent)
    },

    /**
     * Asynchronously submits a comment to be persisted on the server.
     * Returns a promise that passes the response as argument to all callbacks
     * after it's resolved
     */
    persistComment(url, params) {
        return new Promise((resolve, reject) => {
            io
                .request(url, {
                    type: 'POST',
                    data: params,
                    dataType: 'json',
                })
                .then(response => {
                    if (!response || !response.success) {
                        reject(new Error('Something went wrong.'))
                        return
                    }

                    resolve(response)
                }, reject)
        })
    },

    _onDeleteCommentClick(e) {
        const $target = $(e.target)
        const formAction = $target.attr('data-form-action')
        const $deleteCommentForm = $('.js-delete-wire-comment-form')

        // Modify form action url if trigger contains data-form-action
        if (formAction) {
            $deleteCommentForm.attr('action', formAction)
        }

        // Show dialog
        new DeleteEntryModalView({
            el: $deleteCommentForm,
            target: $target.closest('.js-wire-item'),
        })

        return false
    },
})

export default WireCommentsView
