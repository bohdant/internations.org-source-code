import $ from 'jquery'
import result from 'lodash/result'
import isUndefined from 'lodash/isUndefined'
import Backbone from 'backbone'
import Subview from 'backbone-subview'
import dispatcher from 'service/event_dispatcher'
import PickOptionsMixin from 'mixin/pick_options'

Backbone.$ = $

/**
 * Base view class
 *
 * - Support for using options to resolve event config (events: {'click {item}': 'handleItemClick', ...})
 * - Automatic binding of render and event handler methods (without having to use bindAll)
 * - Setting options using data attributes
 * - Finding elements using selectors in options (caching the results)
 * - Setting this.options (as Backbone 1.1 removed this)
 * - Event delegation performance optimization
 *
 * @example
 *
 * ExampleView = View.extend({
 *      options: {
 *          baseUrl: '/get',
 *          controlSelector: '.js-control',
 *          itemSelector: '.js-item',
 *          itemDeleteSelector: '.js-item-delete'
 *      },
 *
 *      events: {
 *          'click {itemDelete}': 'handleItemDeleteClick'
 *      },
 *
 *      initialize: function() {
 *          this.applyOptionAttributes('baseUrl'); // for attr data-base-url
 *      },
 *
 *      calculateWidth: function() {
 *          // ...
 *      },
 *
 *      handleItemDeleteClick: function() {
 *          // ...
 *          this.render();
 *      },
 *
 *      render: function() {
 *          // ...
 *          $controls = this.find('control'); // cached and super fast
 *          this.forget('item'); // clear cached
 *          $items = this.find('item');
 *          width = this.calculateWidth();
 *          // ...
 *      },
 * });
 */

const View = Backbone.View.extend(Subview).extend(
    {
        undelegateEvents(...args) {
            // Performance optimization: prevent jquery .off calls
            // by only doing undelegate if we delegated before.
            if (this.__eventsDelegated) {
                View.__super__.undelegateEvents.apply(this, args)
            }
            return this
        },

        delegateEvents(...args) {
            this.resolveEvents()
            View.__super__.delegateEvents.apply(this, args)
            this.__eventsDelegated = true
            return this
        },

        /**
         * Resolves events configuration using selector options.
         * The events object in:
         *      options: {formSelector: '.js-special-form', ...},
         *      events: {'submit {form}': 'handleSubmit'}
         * Then resolves to: events:{'submit .js-special-form': 'handleSubmit'}
         */
        resolveEvents(events) {
            const regex = /{(\S+)}/g
            let len, key

            events = events || result(this, 'events') || {}

            for (key in events) {
                if (regex.test(key)) {
                    const origKey = key
                    const matches = origKey.match(regex) || []
                    len = matches.length

                    while (len--) {
                        const match = matches[len]
                        const prop = this.options[`${match.substr(1, match.length - 2)}Selector`]
                        key = key.replace(match, prop)
                    }

                    events[key] = events[origKey]
                    delete events[origKey]
                }
            }
        },

        _getFindCacheKey(name, $root, includeSelf) {
            let prefix
            $root = $root || this.$el

            if ($root[0] === document) {
                prefix = 'doc!'
            } else if ($root === this.$el) {
                prefix = includeSelf ? 'self!' : 'desc!'
            }

            return prefix ? prefix + name : null
        },

        /**
         * Find elements by name (this.options.<name>Selector) or CSS selector.
         * Results are cached when the $root equals the view $element.
         * Default behavior is to resolve as name, will apply
         * CSS selector when string starts with '!'
         *
         * TODO we should give this some thought as there might be a more
         * elegant way to support both names and custom selectors. Like:
         * '{item} .foo bar' or '&item' or ... and then sync it with the events
         * parsing.
         *
         * @param {String} name 'name' or '! .js-some-selector'
         * @param {Object} [$root] root element
         */
        find(name, $root, _includeSelf, ...rest) {
            const cacheKey = this._getFindCacheKey(name, $root, _includeSelf, ...rest)
            let selector, $result

            // console.log('find', name, 'with cache key:', cacheKey);
            this.__found = this.__found || {}
            $root = $root || this.$el
            $result = cacheKey ? this.__found[cacheKey] : null

            // Find it if nothing in cache
            if (name && !$result) {
                // console.log(name, 'not cached');

                if (name.indexOf('!') === 0) {
                    selector = name.substr(1)
                } else {
                    selector = this.options[`${name}Selector`]
                }

                $result = $root.find(selector)

                if (_includeSelf) {
                    $result = $root.filter(selector).add($root.find(selector))
                }

                if (cacheKey) {
                    this.__found[cacheKey] = $result
                }
            }

            // console.log('found', name, $result);
            return $result
        },

        /**
         * Find elements including the root node itself (see find)
         * Results are cached when the $root equals the view $element.
         * @param {String} name
         * @param {Object} [$root] root element
         */
        findSelf(name, $root) {
            return this.find(name, $root, true)
        },

        /**
         * Finds elements anywhere in the entire DOM (see find)
         * Caches results (per view, not globally)
         */
        findAnywhere(name) {
            return this.find(name, $(document))
        },

        /**
         * Flushes find cache based on arguments otherwise passed to 'find'.
         * @param {String} [name]
         */
        forget(name, $root, _includeSelf) {
            const key = this._getFindCacheKey(name || '', $root, _includeSelf)
            let item

            // If the cache dictionary is not even created, we don't need to flush
            if (this.__found === undefined) {
                return
            }

            if (key) {
                if (name) {
                    delete this.__found[key]
                } else {
                    // flush all based on key as prefix
                    for (item in this.__found) {
                        if (item.indexOf(key) === 0) {
                            delete this.__found[item]
                        }
                    }
                }
            }
        },

        /**
         * Flushes cache based on arguments otherwise passed to 'findSelf'
         */
        forgetSelf(name, $root) {
            this.forget(name, $root, true)
        },

        /**
         * Flushes cache based on arguments otherwise passed to 'findAnywhere'
         */
        forgetAnywhere(name) {
            this.forget(name, $(document))
        },

        /**
         * Sets passed options using data attributes.
         * Supports strings, numbers and booleans.
         *
         * @example
         *
         * this.applyOptionAttributes('postUrl', 'errorContainer');
         * will set this.options.postUrl and this.options.errorContainer
         * using attributes data-post-url and data-error-container
         */
        applyOptionAttributes(...optionNames) {
            let len = optionNames.length
            let value

            while (len--) {
                const attrName = `data-${optionNames[len].replace(/([A-Z])/g, '-$1').toLowerCase()}`

                if (this.el) {
                    value = this.el.getAttribute(attrName)

                    if (value === 'true') {
                        value = true
                    } else if (value === 'false') {
                        value = false
                    } else if (/^\d+$/.test(value)) {
                        value = parseInt(value, 10)
                    }

                    if (value !== undefined && value !== null) {
                        // eslint-disable-next-line internations/no-this-options-assignment
                        this.options[optionNames[len]] = value
                    }
                }
            }
        },

        setHtml(htmlString) {
            this.$el.html(htmlString)
        },

        show() {
            this.$el.removeClass('is-hidden')
        },

        hide() {
            this.$el.addClass('is-hidden')
        },

        isHidden() {
            return this.$el.hasClass('is-hidden')
        },

        /**
         * Returns height including padding and border but not margin
         */
        getHeight() {
            return this.$el.outerHeight()
        },

        setHeight(height) {
            this.$el.height(height)
        },

        redraw() {
            dispatcher.dispatch('redraw', this.el)
        },
    },
    {
        querySelector(selector, containerDomElement) {
            if (containerDomElement !== undefined && containerDomElement !== null) {
                let [result] = $(containerDomElement).find(selector)

                if (isUndefined(result)) {
                    ;[result] = $(containerDomElement).parents(selector)
                }

                return result
            }
            return $(selector)[0]
        },

        /** @deprecated */
        create(Klass, options) {
            return new Klass(options)
        },
    }
)

Object.assign(View.prototype, PickOptionsMixin)

export default View
