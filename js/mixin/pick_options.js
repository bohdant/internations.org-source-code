import _ from 'lodash'

function result(val) {
    return _.isFunction(val) ? val() : val
}

export default {
    pickOptions(options, ...defaults) {
        if (!defaults.length) {
            throw new Error('Defaults must be defined')
        }

        // Convert the options from a function (if needed)
        const optionsResult = result(options) || {}

        // Convert the defaults from a list of functions (if needed)
        const defaultsResult = defaults.map(result)

        // Merge all the default options into a new object where the first takes precedence
        const mergedDefaults = Object.assign({}, ...defaultsResult)

        // Get all the keys from the defaults and eliminate other properties from the passed in options
        const mergedDefaultsKeys = Object.keys(mergedDefaults)
        const pickedOptions = _.pick(optionsResult, mergedDefaultsKeys)

        return Object.assign({}, ...defaultsResult, pickedOptions)
    },
}
