import View from 'view/view'
import Router from 'service/router'

import template from 'component/header/template/twinkle_list_item.tmpl'
import MicroUserView from 'component/user/micro_user'

const TwinkleResultView = View.extend({
    tagName: 'li',
    className: 'headerFlyoutList__item',
    template,

    _renderUser() {
        return this.initSubview(MicroUserView, {
            el: this.$('.js-twinkle-user'),
            model: this.model.getEmbedded('user'),
            size: 'xsmall',
        }).render()
    },

    render() {
        this.$el.html(
            this.template({
                twinkle: this.model.toJSON(),
                link: {
                    twinkle: Router.path('twinkle_twinkle_index', null, {
                        query: { ref: 'he_stw' },
                    }),
                },
            })
        )

        this._renderUser()

        return this
    },
})

export default TwinkleResultView
