import View from 'view/view'
import windowView from 'shared/view/window'

const WINDOW_HEIGHT = 600
const WINDOW_WIDTH = 600

const ShareButtonView = View.extend({
    events: {
        click: '_onSocialShareButtonClick',
    },

    _onSocialShareButtonClick(event) {
        event.preventDefault()

        const positionTop = (windowView.getHeight() - WINDOW_HEIGHT) / 2
        const positionLeft = (windowView.getWidth() - WINDOW_WIDTH) / 2

        window.open(
            event.target.href,
            'sharer',
            `top=${positionTop},left=${positionLeft},toolbar=0,status=0,width=${WINDOW_HEIGHT},height=${WINDOW_HEIGHT}`
        )
    },
})

export default ShareButtonView
