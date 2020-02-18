import View from 'view/view'
import windowView from 'shared/view/window'

const DropdownView = View.extend({
    options: {
        selector: '.js-dropdown',
        dropdownTriggerSelector: '.js-dropdown-trigger',
        dropdownMenuSelector: '.js-dropdown-menu',
    },

    events: {
        'click .js-dropdown-trigger': '_onDropdownTriggerClick',
    },

    initialize() {
        this._isOpen = false
        this._preventClose = false

        this.$trigger = this.$(this.options.dropdownTriggerSelector)
        this.$dropdownMenu = this.$(this.options.dropdownMenuSelector)

        // close dropdown when clicking outside
        this._onBodyClick = this._onBodyClick.bind(this)
        windowView.$el.on('click', this._onBodyClick)
    },

    _onBodyClick() {
        if (!this._isOpen) {
            return
        }

        if (this._preventClose) {
            this._preventClose = false
            return
        }

        this.closeDropdown()
    },

    _onDropdownTriggerClick() {
        if (this.isDisabled()) {
            return
        }

        if (this._isOpen) {
            this.closeDropdown()
        } else {
            this.openDropdown()
            this._preventClose = true
        }
    },

    isOpen() {
        return this._isOpen
    },

    isTriggerClicked() {
        return this._preventClose
    },

    openDropdown() {
        this._isOpen = true
        this.$trigger.addClass('is-open')
        this.$dropdownMenu.removeClass('is-hidden')
    },

    closeDropdown() {
        this._isOpen = false
        this.$trigger.removeClass('is-open')
        this.$dropdownMenu.addClass('is-hidden')
    },

    disable() {
        this.$trigger.addClass('is-disabled')
        this.$el.addClass('is-disabled')
    },

    enable() {
        this.$trigger.removeClass('is-disabled')
        this.$el.removeClass('is-disabled')
    },

    isDisabled() {
        return this.$el.hasClass('is-disabled')
    },

    remove() {
        View.prototype.remove.call(this)

        windowView.$el.off('click', this._onBodyClick)
    },
})

export default DropdownView
