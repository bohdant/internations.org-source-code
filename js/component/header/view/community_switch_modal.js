import $ from 'jquery'
import View from 'view/view'
import template from 'component/header/template/community_switch_modal.tmpl'
import currentUserLocationModel from 'shared/model/current_user_location'
import CommunitiesSearchModel from 'component/quick_search/model/communities_search'
import HomeCommunityView from 'component/community_selector/view/home_community'
import CommunityFlyout from 'component/community_selector/view/localcommunity_flyout'
import MoreCommunitiesView from 'component/community_selector/view/more_communities'

const CommunitySwitchModalView = View.extend({
    template,

    events: {
        'click .js-close-btn': '_onCloseBtnClick',
    },

    render() {
        this.setElement(this.template())
        $('body')
            .addClass('is-community-switch-modal-open')
            .append(this.el)

        this.initSubview(HomeCommunityView, {
            el: this.$('.js-home-community'),
        }).render()

        currentUserLocationModel.fetchOnce().then(() => {
            const coordinates = currentUserLocationModel.get('coordinates')
            const communitiesSearchNearbyModel = new CommunitiesSearchModel({ coordinates })

            this.initSubview(CommunityFlyout, {
                el: this.$('.js-community-selector'),
                communitiesSearchNearbyModel,
                communitiesSearchModel: new CommunitiesSearchModel({
                    coordinates,
                    minLength: 2,
                }),
            }).render()

            this.initSubview(MoreCommunitiesView, {
                el: this.$('.js-more-communities'),
                model: communitiesSearchNearbyModel,
            }).render()
        })

        return this
    },

    _onCloseBtnClick() {
        $('body').removeClass('is-community-switch-modal-open')
        this.el.remove()
        this.destroySubviews()
    },
})

export default CommunitySwitchModalView
