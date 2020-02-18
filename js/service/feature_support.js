import $ from 'jquery'

const cachedResults = {}
const localStorageBeforeUnloadKey = 'beforeUnloadSupported'

/**
 * Transition support check. Some browsers (lt IE10) don't have it.
 */
const hasTransitions = function() {
    if (cachedResults.transition !== undefined) {
        return cachedResults.transition
    }

    const elem = document.createElement('div')
    const transitions = {
        transition: 'transitionend',
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend',
        OTransition: 'otransitionend',
    }

    for (const t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
            cachedResults.transition = true
            return true
        }
    }
    cachedResults.transition = false
    return false
}

const getTransitionEndEventNames = function() {
    return ['webkitTransitionEnd', 'otransitionend', 'oTransitionEnd', 'transitionend']
}

/**
 * From Modernizr:
 * https://github.com/Modernizr/Modernizr/blob/4eba958/feature-detects/storage/localstorage.js#L38
 */
const testLocalStorage = function() {
    if (cachedResults.localStorage !== undefined) {
        return cachedResults.localStorage
    }

    const key = 'internations-localstorage'
    try {
        window.localStorage.setItem(key, key)
        window.localStorage.removeItem(key)

        cachedResults.localStorage = true
        return true
    } catch (e) {
        cachedResults.localStorage = false
        return false
    }
}

const testSessionStorage = function() {
    if (cachedResults.sessionStorage !== undefined) {
        return cachedResults.sessionStorage
    }

    const key = 'internations-sessionstorage'
    try {
        window.sessionStorage.setItem(key, key)
        window.sessionStorage.removeItem(key)

        cachedResults.sessionStorage = true
        return true
    } catch (e) {
        cachedResults.sessionStorage = false
        return false
    }
}

/**
 * Based on http://jsfiddle.net/pmorch/tW827/
 * Detect beforeUnload support (e.g. Safari on iOS doesn't trigger it)
 */
const beforeUnload = function() {
    const field = localStorageBeforeUnloadKey

    if (testLocalStorage() && window.localStorage.getItem(field) && window.localStorage.getItem(field) === 'yes') {
        return true
    }
    return false
}

const _setupBeforeUnloadCheck = function() {
    const field = localStorageBeforeUnloadKey

    if (testLocalStorage() && !window.localStorage.getItem(field)) {
        $(window).on('beforeunload', () => {
            window.localStorage.setItem(field, 'yes')
        })
        $(window).on('unload', () => {
            // If unload fires, and beforeunload hasn't set the field,
            // then beforeunload didn't fire and is therefore not
            // supported (cough * iPad * cough)
            if (!window.localStorage.getItem(field)) {
                window.localStorage.setItem(field, 'no')
            }
        })
    }
}

_setupBeforeUnloadCheck()

export default {
    hasTransitions,
    getTransitionEndEventNames,
    localStorage: testLocalStorage,
    sessionStorage: testSessionStorage,
    beforeUnload,
}
