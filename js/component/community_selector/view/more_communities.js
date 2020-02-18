/**
 * More communities component with the count
 *
 * Expects CommunitiesSearch model
 */

import View from 'view/view'
import template from 'component/community_selector/template/more_communities.tmpl'
import templateBR06 from 'component/community_selector/template/more_communities_br06.tmpl'
import experiment from 'service/experiment'

const MoreCommunitiesView = View.extend({
    template: experiment.segment('br06').isSegmentA() ? template : templateBR06,

    initialize() {
        this.listenTo(this.model, 'change:totalResultCount change:initialized', this.render)
    },

    render() {
        this.$el.html(this.template({ search: this.model.toJSON() }))

        return this
    },
})

export default MoreCommunitiesView
