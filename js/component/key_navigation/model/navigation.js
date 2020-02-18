import Model from 'model/model'

const NavigationModel = Model.extend({
    defaults: {
        index: -1,
        total: 0,
    },

    reset() {
        this.set('index', -1)
    },

    next() {
        if (this.get('index') === this.get('total') - 1) {
            this.set({ index: 0 })
        } else {
            this.set({ index: this.get('index') + 1 })
        }

        return this
    },

    prev() {
        // index < 0 if it's reset state
        if (this.get('index') <= 0) {
            this.set({ index: this.get('total') - 1 })
        } else {
            this.set({ index: this.get('index') - 1 })
        }

        return this
    },

    updateElements() {
        this.trigger('Navigation:updateElements')
    },

    select() {
        this.trigger('Navigation:select')
    },
})

export default NavigationModel
