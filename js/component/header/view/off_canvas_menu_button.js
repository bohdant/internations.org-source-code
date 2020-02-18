import View from 'view/view'

const OffCanvasMenuButtonView = View.extend({
    cancelNextClick: false,

    events: {
        click: '_onClick',
        touchstart: '_onTouchstart',
    },

    _onClick(event) {
        event.stopPropagation()

        if (this.cancelNextClick) {
            this.cancelNextClick = false
        } else {
            this.trigger('OffCanvasMenuButton:click')
        }
    },

    // make sure menu is opening before 'touchend'
    // and do not fire the 'OffCanvasMenuButton:click' event twice
    _onTouchstart(event) {
        // Prevent the click event
        event.preventDefault()

        this.cancelNextClick = true
        this.trigger('OffCanvasMenuButton:click')
    },
})

export default OffCanvasMenuButtonView
