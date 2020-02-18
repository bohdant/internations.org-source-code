/**
 * AjaxFormView submits forms via Ajax and dynamically updates content.
 *
 * Features:
 * - Holds back native submit of the form to do an XHR instead
 * - If all ok it replaces the container element with server response
 * - Enables and disables submit button(s) during submission
 * - Optionally shows success flash message after submit/response
 * - Optionally redirects window to successRedirectUrl
 * - Renders server error message if server does not provide new HTML
 * - Provides callbacks onSuccess, onError, onAfterSuccess and onAfterError
 *
 * @events
 * - AjaxForm:submit - submit form event
 * - AjaxForm:submit:<name> - submit form event (with name suffix, if name option provided)
 * - AjaxForm:success - successful form submit event
 * - AjaxForm:success:<name> - successful form submit event (with name suffix, if name option provided)
 * - AjaxForm:error - unsuccessful form submit event
 * - AjaxForm:error:<name> - unsuccessful form submit event (with name suffix, if name option provided)
 *
 * @deprecated
 *  Unprefixed events (e.g. "submit") and all callbacks that are passed as options are deprectead.
 *  Events should be used instead
 */

import $ from 'jquery'
import _ from 'lodash'
import 'vendor/bootstrap-modal'

import dispatcher from 'service/event_dispatcher'
import io from 'service/io'
import Logger from 'service/logger'

import View from 'view/view'
import FormValidationFormView from 'view/form_validation_form'
import stickyFlashMessage from 'shared/view/sticky_flash_message'

const AjaxFormView = View.extend({
    // Container element containing the <form> itself
    el: '.js-ajax-form',

    options: {
        // name suffix for event trigger
        name: '',

        onSuccess: null,
        onError: null,
        onAfterSuccess: null,
        onAfterError: null,

        successRedirectUrl: null,
        successMessage: null,
        successSuppressFlash: false,
        errorMessage: null,
        serverErrorFadeSpeed: 5000,
        serverErrorMessage: 'Sorry, an error occurred. Please reload the page and try again.',
        dispatchEvent: null,
        dispatchEventValue: null,
        isDumbView: false,
        // Useful if you need the ajaxForm to work with a preexisting API,
        // or do some sort of processing before the response gets passed along
        // to the actual response handler.
        parseResponse(response) {
            return response
        },
    },

    initialize() {
        _.bindAll(this, _.functionsIn(this))

        this.applyOptionAttributes('successSuppressFlash', 'successRedirectUrl', 'dispatchEvent', 'dispatchEventValue')

        // Properties
        this.$previousForm = null

        // Fade out success message that we might got initially in our markup
        this.fadeOutServerErrors()

        // Initialize content
        this.initializeContent()
    },

    initializeContent() {
        // Make sure we are not using a cached findSelf() result since this method also gets called
        // on server response handlers
        this.forgetSelf('! form', this.$el)

        // Bind all forms, typically single one. If there is any validation on these forms we expect that
        // to have been initialized already. To be sure we unbind our onSubmit handler because
        // legacy code might abuse this view and initialize it a second time after submit.

        this.findSelf('! form', this.$el)
            .off('submit', this.onSubmit)
            .on('submit', this.onSubmit)

        // Show submit buttons when initialized
        this.$el.find(':submit').removeClass('is-hidden')
    },

    _hasAjaxFormChildren() {
        return this.$el.find('.js-ajax-form, .js-managed-ajax-form').length > 0
    },

    onSubmit(e) {
        // No submit thanks
        e.preventDefault()

        const $form = $(e.target)
        const url = $form.attr('action')
        const type = $form.attr('method')

        // Avoid double submission for AJAX forms wrapping another AJAX form
        if (this._hasAjaxFormChildren()) {
            Logger.warning(`Nested AJAX forms found. Skip submitting the outer form that would submit to \
"${type.toUpperCase()} ${url}". Make sure that the server response does not contain an element \
with a "js-ajax-form" or "js-managed-ajax-form" class.`)
            return
        }

        const data = $form.serializeArray()
        const ajaxOptions = { type, url, data, dataType: 'json' }

        // Keep ref for UI business later
        this.$previousForm = $form
        this.disableForm($form)
        FormValidationFormView.hideError($form[0])

        // @deprecated View-prefixed events should be used
        // Cant be removed right now - because of wide usage
        this.trigger('submit', ajaxOptions)

        this.trigger('AjaxForm:submit', ajaxOptions)
        if (this.options.name) {
            this.trigger(`AjaxForm:submit:${this.options.name}`, ajaxOptions)
        }

        if (this.options.isDumbView) {
            return
        }

        // Ajax request
        io
            .request(ajaxOptions)
            .done(this.onServerResponse)
            .fail(this.onServerError)
    },

    onServerResponse(rawResponse, textStatus, xhr) {
        // Parse the response. Default behavior is to just pass the response along
        const response = this.options.parseResponse(rawResponse, this.options)

        const success = Boolean(response.success)
        const successMessage = response.message || this.options.successMessage
        const errorMessage = response.errorMessage || this.options.errorMessage
        const redirectUrl = response.redirectUrl || this.options.successRedirectUrl
        const formHtml = response.formHtml
        const form = this.$previousForm[0]

        // Handling success cases and following instructions from Backend
        if (success) {
            if (response.reload) {
                window.location.reload()
                return
            }

            if (redirectUrl) {
                window.location = redirectUrl
                return
            }

            this.trigger('AjaxForm:success', { response })
            if (this.options.name) {
                this.trigger(`AjaxForm:success:${this.options.name}`, { response })
            }

            // Callback on success
            if (this.options.onSuccess) {
                this.options.onSuccess(response)
            }

            if (this.options && typeof this.options.backboneCallback === 'function') {
                this.options.backboneCallback()
            }

            // Show success message
            if (!this.options.successSuppressFlash && successMessage) {
                stickyFlashMessage.show(successMessage)
            }
        }

        // Handling error cases
        // if response.errorMessage was passed, we show that errorMessage
        // as a stickyFlashMessage.
        // Otherwise, no success and no formHtml means we need to improvise and
        // render an error ourselves
        if (!success) {
            if (errorMessage) {
                stickyFlashMessage.show(errorMessage, { type: 'error' })
            } else if (!formHtml) {
                // Render errors in form
                this.onServerError(xhr)
            }

            this.trigger('AjaxForm:error', { response })
            if (this.options.name) {
                this.trigger(`AjaxForm:error:${this.options.name}`, { response })
            }

            if (this.options.onError) {
                this.options.onError(response)
            }
        }

        // Enable form
        if (form) {
            this.enableForm($(form))
            this.fadeOutServerErrors()
        }

        // Always render new form content
        if (formHtml) {
            this.$el.html(formHtml)
            dispatcher.dispatch('redraw', this.el)
            this.initializeContent()
        }

        if (success && this.options.onAfterSuccess) {
            // Execute callback after success response form got rendered
            this.options.onAfterSuccess(response)
        } else if (!success && this.options.onAfterError) {
            // Execute callback after error response form got rendered
            this.options.onAfterError(response)
        }

        // Dispatch event if we need to
        if (this.options.dispatchEvent) {
            dispatcher.dispatch(this.options.dispatchEvent, {
                value: this.options.dispatchEventValue,
                result: success,
                el: this.el,
            })
        }

        // In case we don't get html, we reset the form we submitted
        if (!formHtml) {
            if (form) {
                form.reset()
            }
            // And close any modal currently open
            // TODO INDEV-4054 think of a better way to do this so we can decouple from bootstrap-modal.
            // Perhaps dispatch some general UI event that will be picked up by the common controller?
            $('.modal').modal('hide')
        }
    },

    onServerError(xhr) {
        const form = this.$previousForm[0]

        // Make sure we have an enabled form again
        this.enableForm(this.$previousForm)
        if (io.requestIsAbortedOrClosed(xhr)) {
            // Aborted, no need to render errors
            return
        }

        // Render error message ourselves using static helper method of validation framework.
        // This does not require any validation to be initialized, as this view should be
        // validation agnostic.
        if (form) {
            FormValidationFormView.renderError(form, this.options.serverErrorMessage)
        }
    },

    fadeOutServerErrors() {
        _.delay(() => {
            this.$el.find('.success').fadeOut('slow')
        }, this.options.serverErrorFadeSpeed)
    },

    /**
     * Helper function that disables the form's submit button.
     * If the form has a data-loading-text attribute, we switch the text of the submit button
     * to give additional feedback to the user.
     * @param  {jQuery} $form
     */
    disableForm($form) {
        $form = $form || this.$el

        const loadingText = $form.data('loading-text')
        const $submitButtons = $form.find(':submit')

        if (loadingText) {
            $form.data('original-submit-text', $submitButtons.text())
            $submitButtons.text(loadingText)
        }

        $submitButtons.prop('disabled', true).addClass('is-disabled')
        this.$el.addClass('is-holdingbacksubmit')
    },

    /**
     * Re-enable a form. Also reverts a submit button text if needed.
     */
    enableForm($form) {
        $form = $form || this.$el

        const originalSubmitText = $form.data('original-submit-text')
        const $submitButtons = $form.find(':submit')

        if (originalSubmitText) {
            $submitButtons.text(originalSubmitText)
        }
        $submitButtons.prop('disabled', false).removeClass('is-disabled')
        this.$el.removeClass('is-holdingbacksubmit')

        // Show submit buttons when initialized
        $submitButtons.removeClass('is-hidden')
    },
})

export default AjaxFormView
