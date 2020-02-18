import Router from 'service/router'
import View from 'view/view'
import template from 'component/teaser_group/template/small.tmpl'

const GroupView = View.extend({
    template,

    defaultOptions: {
        imageLinkRef: '',
        titleLinkRef: '',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    render() {
        this.destroySubviews()

        const activityGroupId = this.model.get('activityGroupId')
        const imageLinkRefQuery = this.options.imageLinkRef ? { ref: this.options.imageLinkRef } : {}
        const titleLinRefQuery = this.options.titleLinkRef ? { ref: this.options.titleLinkRef } : {}

        this.$el.html(
            this.template({
                group: this.model.toJSON(),
                link: {
                    image: Router.path(
                        'activity_group_activity_group_get',
                        { activityGroupId },
                        {
                            query: imageLinkRefQuery,
                        }
                    ),
                    title: Router.path(
                        'activity_group_activity_group_get',
                        { activityGroupId },
                        {
                            query: titleLinRefQuery,
                        }
                    ),
                },
            })
        )

        return this
    },
})

export default GroupView
