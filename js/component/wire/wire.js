import dispatcher from 'service/event_dispatcher'
import View from 'view/view'
import InfiniteScrollingView from 'view/infinite_scrolling'
import WireStatusUpdateView from 'component/wire/view/wire_status_update'
import WireCommentsView from 'component/wire/view/wire_comments'

const WirePost = View.extend({
    initialize() {
        if (this.model) {
            this.listenTo(this.model, 'request', this._handleRequest)
            this.listenTo(this.model, 'sync', this.render)
        }
    },

    _handleRequest() {
        this.$el.addClass('is-loading')
    },

    _parseStatusUpdateResponse(rawResponse) {
        if (rawResponse.success) {
            return Object.assign({}, rawResponse, {
                formHtml: rawResponse.content.form,
                entry: rawResponse.content.entry,
            })
        }
        return rawResponse
    },

    render() {
        this.destroySubviews()

        if (this.model) {
            this.$el.removeClass('is-loading').html(this.model.get('content'))
        }

        dispatcher.dispatch('redraw', this.el)

        this.initializeSubviews()

        return this
    },

    initializeSubviews() {
        this.initSubview(InfiniteScrollingView)

        this.initSubview(WireStatusUpdateView, {
            el: this.$('.js-wire-status-update-container'),
            parseResponse: this._parseStatusUpdateResponse,
        })

        this.initSubview(WireCommentsView, {
            el: this.$('#js-wire-container'),
        })

        return this
    },
})

export default WirePost
