import View from 'view/view'
import ShareButton from 'view/share_button'

const ShareButtonsView = View.extend({
    initialize() {
        this.$('.js-socialShareButton').each((k, el) => this.initSubview(ShareButton, { el }))
    },
})

export default ShareButtonsView
