import application from 'application'
import View from 'view/view'

export default View.extend({
    constructor(options = {}, ...args) {
        const controllerArgs = [Object.assign(options, { el: 'body' }), ...args, application.start()]

        View.apply(this, controllerArgs)
    },
})
