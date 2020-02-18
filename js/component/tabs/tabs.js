/**
 * Tabs component
 *
 * @public
 *
 * - select(tabName)  - select tab
 * - getContentRoot() - gets tab content node
 *
 * @events
 *  - Tabs:change
 *  - Tabs:change:<name>
 *
 * @example
 *
 * var tabs = new TabsCollection([
 *   { name: 'recommended', title: 'Recommended users' },
 *   { name: 'visitors', title: 'Visitors', isActive: true }
 * ]);
 *
 * var tabsView = View.create(Tabs, {
 *   el: '.js-tabs-view',
 *   tabs: tabs
 * });
 *
 * tabs.activate('recommended');
 */

import View from 'view/view'
import ListView from 'component/tabs/view/list'
import template from 'component/tabs/template/tabs.tmpl'

const TabsView = View.extend({
    template,

    bubbleEvents: {
        'Tab:click': '_onTabClick',
    },

    initialize() {
        this.collection.activateFirstIfNotActive()

        // fire initial change event next tick
        // to allow render view before
        setTimeout(this._fireInitialEvent.bind(this), 0)
    },

    _onTabClick(payload) {
        this.select(payload.tab.get('name'))
    },

    select(name) {
        if (this.collection.isActive(name)) {
            return
        }

        const previousTab = this.collection.getActive()
        this.collection.activate(name)
        const currentTab = this.collection.getActive()

        this._fireEvent({ currentTab, previousTab })
    },

    _fireEvent(payload) {
        this.trigger('Tabs:change', payload)
        this.trigger(`Tabs:change:${payload.currentTab.get('name')}`, payload)
    },

    /**
     * Fire initial `change` event
     * Notice: currentTab === previousTab
     */
    _fireInitialEvent() {
        const currentTab = this.collection.getActive()

        this._fireEvent({
            currentTab,
            previousTab: currentTab,
        })
    },

    // public API to obtain content root mode
    getContentRoot() {
        return this.$('.js-tabs-content')
    },

    render() {
        this.$el.html(this.template())

        this.initSubview(ListView, {
            el: this.$('.js-tabs-nav'),
            collection: this.collection,
            wrapperClass: '',
        }).render()

        return this
    },
})

export default TabsView
