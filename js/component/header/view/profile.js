/**
 * Profile view. Shows profile flyout
 */

import $ from 'jquery'
import _ from 'lodash'
import View from 'view/view'
import PopoverView from 'component/popover/popover'
import ProfileFlyoutView from 'component/header/view/profile_flyout'

import windowView from 'shared/view/window'
import experiment from 'service/experiment'

const ProfileView = View.extend({
    _popoverView: null,

    events: {
        'click .js-flyout-trigger': 'toggle',
    },

    bubbleEvents: {
        'ProfileFlyout:openInterests': '_onOpenInterests',
    },

    initialize() {
        // initialize subviews once
        this._initPopover = _.once(this._initPopover)
    },

    toggle() {
        this._popoverView = this._initPopover().toggle()
    },

    _initPopover() {
        let extraClasses = 't-headerProfileFlyout popover-header popover-headerProfileFlyout'

        if (windowView.isBelowMaxPageWidth()) {
            extraClasses += ' popover-headerBelowDesktop'
        }

        // Profile flyout popover
        return this.initSubview(
            PopoverView,
            {
                name: 'profileFlyout',
                el: this.$('.js-flyout-trigger'),
                content: this._initFlyout().el,
                extraClasses,
                preset: experiment.segment('br06').isSegmentA()
                    ? 'navigationalDropdownWithClose'
                    : 'navigationalDropdown',
            },
            { remove: false }
        )
    },

    _initFlyout() {
        return this.initSubview(
            ProfileFlyoutView,
            {
                // flyout content node is outside of the current element
                // inside of the general header popover's content placeholder
                el: $('.js-header-profileFlyout'),
            },
            { remove: false }
        )
    },

    _onOpenInterests() {
        this._popoverView.close()
    },
})

export default ProfileView
