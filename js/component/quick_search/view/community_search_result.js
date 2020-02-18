/**
 * Community search result view - raw with city/country/distance
 *
 * @options
 * - model: CommunityModel - community model to render
 * - [info: Boolean] - Prevent info block from showing
 * - [silent: Boolean] - Prevent view from triggering events
 *                       It's needed for LCS, when it's a part of LocalcommunitySelectField
 *                       to prevent dropdown from closing
 *
 * @public
 * - render()
 */

import View from 'view/view'
import template from 'component/quick_search/template/community_search_result.tmpl'

import Model from 'model/model'

const ViewState = Model.extend({
    defaults: {
        info: true,
        silent: false,
    },
})

const UserSearchResultView = View.extend({
    tagName: 'li',
    className: 't-localcommunity-item js-navigation-item headerFlyoutList__item headerFlyoutList__item-searchResult',
    template,

    initialize(options) {
        options = options || {}

        this.state = new ViewState({
            info: options.info,
            silent: options.silent,
        })
    },

    events: {
        click: 'selectCommunity',
        'navigation:select': 'selectCommunity',
    },

    render() {
        this.$el.html(
            this.template({
                community: this.model.toJSON(),
                state: this.state.toJSON(),
            })
        )

        return this
    },

    selectCommunity() {
        // do not notify parents about the change
        if (this.state.get('silent')) {
            return
        }

        this.trigger('CommunitySearchResult:select', {
            community: this.model,
        })
    },
})

export default UserSearchResultView
