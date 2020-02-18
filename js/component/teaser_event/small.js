import View from 'view/view'
import template from 'component/teaser_event/template/small.tmpl'

const EventView = View.extend({
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

        this.$el.html(
            this.template({
                event: this.model.toJSON(),
                link: {
                    image: this.model.getLink('self', {
                        query: { ref: this.options.imageLinkRef },
                    }),
                    title: this.model.getLink('self', {
                        query: { ref: this.options.titleLinkRef },
                    }),
                },
            })
        )

        return this
    },
})

export default EventView
