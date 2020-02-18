/**
 * Membership icon tooltip content
 *
 * @options:
 * - model: UserModel
 * - [ref='']: String - tooltip "Learn more" link ref
 */

import View from 'view/view'
import Router from 'service/router'

import template from 'component/user/template/membership_icon_tooltip.tmpl'

export default View.extend({
    template,

    defaultOptions: {
        ref: '',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    render() {
        this.$el.html(
            this.template({
                user: this.model.toJSON(),
                link: {
                    learnMoreAdmin: Router.path('recruiting_team', null, {
                        query: { ref: this.options.ref },
                    }),
                    learnMoreAmbassador: Router.path('about_get_involved_ambassador_index', null, {
                        query: { ref: this.options.ref },
                    }),
                    learnMoreConsul: Router.path('about_get_involved_consul_index', null, {
                        query: { ref: this.options.ref },
                    }),
                    learnMoreAlbatross: Router.path('membership_membership_index', null, {
                        query: { ref: this.options.ref },
                    }),
                },
            })
        )

        return this
    },
})
