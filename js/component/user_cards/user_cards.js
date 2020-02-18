import _ from 'lodash'
import View from 'view/view'
import UserCardCollection from 'component/user_cards/collection/user_cards'
import UserCardsView from 'component/user_cards/view/user_cards'
import windowView from 'shared/view/window'
import dispatcher from 'service/event_dispatcher'

const UserCardView = View.extend({
    initialize() {
        // disable the user card for mobile
        if (windowView.isMobile()) {
            return false
        }

        this.view = this.initSubview(UserCardsView, {
            el: this.el,
        })

        this._initializeCollection()
        this._subscribe()
    },

    _initializeCollection() {
        this.collection = new UserCardCollection()
    },

    _subscribe() {
        this.listenTo(this.view, 'userCard:open', this.openUserCard)

        this.listenTo(this.collection, 'change:content', this.handleUserCardSync)
        this.listenTo(this.collection, 'change:el change:view', this.updateUserCard)

        dispatcher.on('userCards:close', this.view.closeOpenedPopovers)
        dispatcher.on('modal:opened', this.view.closeOpenedPopovers)
    },

    openUserCard(payload) {
        const model = this.collection.get(payload.id)

        if (_.isUndefined(model)) {
            this.collection.add(payload)
        } else {
            model.update(payload)
        }
    },

    handleUserCardSync(model) {
        const cardView = this.view.createUserCardView({
            content: model.get('content'),
        })

        model.set('view', cardView)

        return cardView
    },

    updateUserCard(model) {
        if (!_.isUndefined(model.get('view'))) {
            this.view.updateUserCard({
                el: model.get('el'),
                content: model.get('view').$el,
            })
        }
    },
})

export default UserCardView
