import View from 'view/view'
import Router from 'service/router'
import template from 'component/teaser_forum/template/forum.tmpl'

const ForumView = View.extend({
    template,

    defaultOptions: {
        imageLinkRef: '',
        titleLinkRef: '',

        // only for large forum
        moreLinkRef: '',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    render() {
        this.destroySubviews()

        const selfLink = this.model.getLink('self')

        this.$el.html(
            this.template({
                entry: this.model.toJSON(),
                link: {
                    image: Router.generateUrl(selfLink, {
                        query: { ref: this.options.imageLinkRef },
                    }),
                    title: Router.generateUrl(selfLink, {
                        query: { ref: this.options.titleLinkRef },
                    }),
                    more: Router.generateUrl(selfLink, {
                        query: { ref: this.options.moreLinkRef },
                    }),
                },
            })
        )

        this.redraw()

        return this
    },
})

export default ForumView
