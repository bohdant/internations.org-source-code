import View from 'view/view'
import template from 'component/teaser_guides/template/guide.tmpl'

const GuideView = View.extend({
    template,

    defaultOptions: {
        imageLinkRef: '',
        titleLinkRef: '',

        // only for large guide
        surtitleLinkRef: '',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    render() {
        this.destroySubviews()

        this.$el.html(
            this.template({
                guide: this.model.toJSON(),
                link: {
                    title: this.model.getLink('self', {
                        query: { ref: this.options.titleLinkRef },
                    }),
                    image: this.model.getLink('self', {
                        query: { ref: this.options.imageLinkRef },
                    }),
                    surtitle: this.model.getLink('self', {
                        query: { ref: this.options.surtitleLinkRef },
                    }),
                },
            })
        )

        return this
    },
})

export default GuideView
