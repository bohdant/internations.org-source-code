/**
 * @todo INDEV-7850 get rid of this
 *
 * @deprecated Do NOT extend from this file anymore
 */

import _ from 'lodash'
import Backbone from 'backbone'

/**
 * Project wide base class
 */
function Base(options, ...args) {
    this._configure(options || {})
    this.initialize(options, args)
}

Base.prototype.initialize = function() {}

/**
 * Based on Backbone code
 * @private
 */
Base.prototype._configure = function(options) {
    if (this.options) {
        options = Object.assign({}, _.result(this, 'options'), options)
    }
    this.options = options
}

/**
 * Get the extend from *some* Backbone class, as it doesn't get exposed seperately.
 * @method extend
 */
Base.extend = Backbone.View.extend

export default Base
