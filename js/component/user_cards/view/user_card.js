import View from 'view/view'
import ConnectButtonView from 'component/connect_button/connect_button'
import TwinkleButtonView from 'view/twinkle_button'
import dispatcher from 'service/event_dispatcher'

const UserCardView = View.extend({
    initialize(options) {
        this.$el.append(options.content)

        // Initialize inner UserCard views (Connect, Message buttons)
        this.initSubview(ConnectButtonView, { el: this.$('.js-connect-button') })
        this.initSubview(TwinkleButtonView, { el: this.$('.js-twinkle-button-view') })

        dispatcher.dispatch('redraw', this.$el)
    },
})

export default UserCardView
