import View from 'view/view'
import template from 'component/header/template/community_flyout_tooltip.tmpl'
import homeCommunityModel from 'shared/model/home_community'

const CommunityFlyoutTooltipView = View.extend({
    template,

    render() {
        this.$el.html(
            this.template({
                community: homeCommunityModel.toJSON(),
            })
        )
        return this
    },
})

export default CommunityFlyoutTooltipView
