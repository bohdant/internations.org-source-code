/**
 * Tooltip component
 *
 * Tooltip is using 'manual' controlled every time.
 *
 * @options
 *  - [name] - If provided - component will trigger event and suffixed event (e.g. Tooltip:show:<name>)
 *  - [trigger='hover'] - How tooltip is triggering. hover|click|focus|manual is allowed to use.
 *                        Notice that this option is not proxied to bootstrap tooltip. Bootstrap tooltip is always
 *                        initialized with 'manual' triggering and is controlled by the view.
 *
 * Twitter bootstrap supported options, they are proxied to tooltip component unmodified
 * See more about options: http://getbootstrap.com/javascript/#tooltips-options
 * - [title='']: String - Title to display
 * - [html=false]: Boolean - Allow HTML content titles
 * - [container=false]: String|false - element selector to append tooltip to.
 * - [placement='top'] String|Function - How to position tooltip: top|bottom|left|right|auto
 *
 * @events
 *   Tooltip:show
 *   Tooltip:show:<options.name>
 *   Tooltip:hide
 *   Tooltip:hide:<options.name>
 *
 * @example
 *
 * this.initSubview(Tooltip, {
 *   el: this.$('.js-component-membership'),
 *   title: 'hello there',
 *   trigger: 'hover'
 * });
 */
import 'vendor/bootstrap-tooltip'
import _ from 'lodash'
import View from 'view/view'
import template from 'component/tooltip/template/tooltip.tmpl'

export default View.extend({
    template,

    events() {
        if (this.options.trigger === 'hover') {
            return {
                mouseenter: '_onMouseEnter',
                mouseleave: '_onMouseLeave',
            }
        }

        if (this.options.trigger === 'click') {
            return {
                click: '_onClick',
            }
        }

        if (this.options.trigger === 'focus') {
            return {
                // show on focus
                focus: '_onFocus',
            }
        }
    },

    defaultOptions: {
        // event suffix
        name: '',

        // hover / focus / click / manual
        // "focus" as trigger causes links inside tooltip not to work
        // because of the $element being the container
        trigger: 'hover',

        html: false,
        container: false,
        placement: 'top',
        title: '',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)

        this._isOpen = false

        this._closeTimeout = null

        this._initTooltip = _.once(this._initTooltip)
    },

    _initTooltip() {
        // init bootstrap tooltip
        this.$el.tooltip({
            template: this.template(),

            // always control it programmatically based on `trigger` option
            trigger: 'manual',

            container: this.options.container,
            html: this.options.html,
            placement: this.options.placement,
            title: this.options.title,
        })

        return this
    },

    /**
     * Toggle tooltip state
     *
     * @param  {Boolean} [state] Tooltip state
     *                           true - show tooltip
     *                           false - hide tooltip
     *                           If not provided - toggle previous state
     * @return {View}            View instance
     */
    toggle(state) {
        if (typeof state === 'undefined') {
            state = !this._isOpen
        }

        // do nothing if state is already the same we're trygin to set
        if (state === this._isOpen) {
            return this
        }

        if (state) {
            // lazy tooltip initialization
            this._initTooltip()
            this.$el.tooltip('show')

            this.trigger('Tooltip:show')
            if (this.options.name) {
                this.trigger(`Tooltip:show:${this.options.name}`)
            }

            this._isOpen = true

            return this
        }

        this.$el.tooltip('hide')
        this.trigger('Tooltip:hide')

        if (this.options.name) {
            this.trigger(`Tooltip:hide:${this.options.name}`)
        }

        this._isOpen = false

        return this
    },

    _onMouseEnter() {
        clearTimeout(this._closeTimeout)
        this.toggle(true)
    },

    _onMouseLeave() {
        // wait 100ms before close.
        // This will prevent closing tooltip during mouse move from target to the tooltip
        // (behavior is needed to click a link inside the tooltip, e.g. inside of membership icon tooltip)
        this._closeTimeout = setTimeout(() => {
            this.toggle(false)
        }, 100)
    },

    _onFocus() {
        this.toggle(true)
    },

    _onClick() {
        this.toggle()
    },

    remove(...args) {
        this.$el.tooltip('destroy')
        return View.prototype.remove.apply(this, args)
    },

    render() {
        return this
    },
})
