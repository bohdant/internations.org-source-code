/**
 * Profile flyout view
 */

import View from 'view/view'
import ModalView from 'component/modal/modal'
import Router from 'service/router'
import InterestsView from 'component/interests/interests'
import analytics from 'service/google_analytics'

import currentUserModel from 'shared/model/current_user'

const ProfileFlyoutView = View.extend({
    events: {
        'click .js-profileFlyout-interests': '_openInterests',
    },

    bubbleEvents: {
        'Modal:opened:interests': '_onInterestsOpened',
        'Modal:hidden:interests': '_onInterestsHidden',
    },

    _onInterestsHidden() {
        this.destroySubviews()
    },

    _onInterestsOpened(payload) {
        analytics.trackEvent('header', 'interests_modal')
        this.initSubview(InterestsView, { el: payload.container })
    },

    _openInterests() {
        this.initSubview(ModalView, {
            name: 'interests',
            url: Router.path('profile_teaser_interest_edit', {
                user: currentUserModel.get('id'),
            }),
            fullHeight: true,
        })

        this.trigger('ProfileFlyout:openInterests')
    },
})

export default ProfileFlyoutView
