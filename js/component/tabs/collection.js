import Collection from 'collection/collection'
import TabsModel from 'component/tabs/model'

const TabsCollection = Collection.extend({
    Model: TabsModel,

    activate(name) {
        this.each(model => {
            model.set('isActive', model.get('name') === name)
        })
    },

    activateFirstIfNotActive() {
        if (!this.length) {
            return
        }

        if (this.getActive()) {
            return
        }

        this.at(0).set('isActive', true)
    },

    isActive(name) {
        return this.some(model => model.get('name') === name && model.get('isActive'))
    },

    getActive() {
        return this.findWhere({ isActive: true })
    },
})

export default TabsCollection
