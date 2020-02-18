/**
 * Show community switching modal. Shows during the community
 * switch as a loading indicator.
 *
 * @example
 *
 *     var communitySwitchView = new CommunitySwitchView();
 *
 *     communitySwitchView
 *         .setCommunity('Munich')
 *         .show();
 */

import View from 'view/view'
import template from 'component/header/template/community_switch.tmpl'
import ModalView from 'component/modal/modal'

const CommunitySwitchView = View.extend({
    template,

    initialize() {
        this._community = ''
    },

    /**
     * Set community to show in the view
     * @param {String} community Community
     */
    setCommunity(community) {
        this._community = community

        return this
    },

    show() {
        this.modal = new ModalView({
            content: this.render().$el,
            classes: 'responsive modal',
        })

        return this
    },

    hide() {
        this.modal.hide()

        return this
    },

    render() {
        this.$el.html(this.template({ community: this._community }))

        return this
    },
})

export default CommunitySwitchView
