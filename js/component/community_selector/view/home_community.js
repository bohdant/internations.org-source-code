import View from 'view/view'
import template from 'component/community_selector/template/home_community.tmpl'

import homeCommunityModel from 'shared/model/home_community'
import browsingCommunityModel from 'shared/model/browsing_community'
import { isUserAmbassador } from 'app/redux/utils/membership'
import dataProvider from 'service/data_provider'

const HomeCommunityView = View.extend({
    className: 'headerHomeCommunity',
    template,

    events: {
        'navigation:select': '_navigationSelect',
        click: '_navigationSelect',
        'click .js-update-community-link': '_updateHomeCommunity',
    },

    options: {
        backStateClassName: 'headerHomeCommunity-back',
    },

    initialize() {
        // set initial state
        // Home !== Browsing => "Moved?"
        // otherwise => "Back to..."
        this.$el.toggleClass(this.options.backStateClassName, !this._isHomeCommunitySameAsBrowsing())
    },

    _isHomeCommunitySameAsBrowsing() {
        return homeCommunityModel.get('id') === browsingCommunityModel.get('id')
    },

    _backToHome() {
        this.trigger('HomeCommunity:backToHome', {
            community: homeCommunityModel,
        })
    },

    _updateHomeCommunity() {
        this.trigger('HomeCommunity:updateHomeCommunity')
    },

    _navigationSelect() {
        // it should be possible to access by navigation only when
        // home community is not the same as browsing community
        if (this._isHomeCommunitySameAsBrowsing()) {
            return
        }

        this._backToHome()
    },

    render() {
        const json = homeCommunityModel.toJSON()

        json.updateHomeCommunityUrl = homeCommunityModel.updateHomeCommunityUrl({
            query: {
                ref: 'he_cm',
            },
        })

        // Ambassadors cannot change their LC, so pass a flag that tells the template not to render the link
        const currentUser = dataProvider.get('currentUser') ? dataProvider.get('currentUser') : null
        json.canEditLocalCommunity = Boolean(currentUser) && !isUserAmbassador(currentUser)

        this.$el.html(this.template({ community: json }))

        return this
    },
})

export default HomeCommunityView
