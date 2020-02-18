import View from 'view/view'
import template from 'component/user_teaser/template/empty.tmpl'

const EmptyView = View.extend({
    template,

    events: {
        'click .js-empty-title': 'handleTitleClick',
        'click .js-empty-link': 'handleLinkClick',
        'click .js-empty-image': 'handleImageClick',
    },

    handleImageClick(event) {
        this.trigger('Empty:imageClick', { event })
    },

    handleTitleClick(event) {
        this.trigger('Empty:titleClick', { event })
    },

    handleLinkClick(event) {
        this.trigger('Empty:linkClick', { event })
    },

    render() {
        this.$el.html(
            this.template({
                empty: this.model.toJSON(),
            })
        )

        return this
    },
})

export default EmptyView
