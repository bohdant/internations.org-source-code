import viewport from 'lib/viewport'
import Router from 'service/router'
import upgradeService from 'service/upgrade'

import View from 'view/view'
import Model from 'model/model'

import template from 'component/upgrade_badge/template/upgrade_badge.tmpl'

export default View.extend({
    template,

    events: {
        'click .js-upgrade-badge': '_onUpgradeBadgeClick',
    },

    initialize() {
        this._setInitialState()
    },

    _setInitialState() {
        this._innerState = new Model({
            sticky: this._isInViewport(),
        })

        this.listenTo(this._innerState, 'change', this.render)
    },

    _isInViewport() {
        return !viewport.inViewport(this.$el)
    },

    _calculateStickyState() {
        this._innerState.set('sticky', this._isInViewport())
    },

    /**
     * Event handlers
     */
    _onUpgradeBadgeClick() {
        upgradeService.track({ name: 'ut:my_account/mobile_header_badge' })
    },

    /**
     * Render methods
     */

    render() {
        this.$el.html(
            this.template({
                url: Router.path('membership_membership_index', null, {
                    query: { ref: 'ms_ul_mhb' },
                }),
                text: this.$el.data('text'),
                options: {
                    isSticky: this._innerState.get('sticky'),
                },
            })
        )

        return this
    },
})
