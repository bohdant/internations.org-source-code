const { XMLHttpRequest: OrigXMLHttpRequest } = window

const xhrStats = { nextId: 0, requests: [] }

const registerCallback = (target, name, callback) => {
    const { originalCallbacks } = target

    originalCallbacks[name] = callback
}

const handler = {
    get: (target, name) => {
        const { request, stats } = target
        const prop = request[name]

        switch (name) {
            case 'open':
                return (...args) => {
                    const [method, url] = args
                    stats.method = method
                    stats.url = url
                    stats.state = 'init'

                    return prop.apply(request, args)
                }
            case 'send':
                return (...args) => {
                    stats.state = 'sent'

                    return prop.apply(request, args)
                }
            case 'addEventListener':
                return registerCallback.bind(undefined, target)
            default:
                if (typeof prop === 'function') {
                    return prop.bind(request)
                }

                return prop
        }
    },

    set: (target, name, value) => {
        const { request } = target

        if (name.startsWith('on')) {
            const callbackName = name.slice(2)

            registerCallback(target, callbackName, value)
            return true
        }

        request[name] = value
        return true
    },
}

const setStateCallback = (target, name, newState) => {
    const { request, stats, originalCallbacks } = target

    request.addEventListener(name, (...args) => {
        stats.state = newState

        if (originalCallbacks[name]) {
            return originalCallbacks[name](...args)
        }
    })
}

export const maybeMockXHR = () => {
    if (typeof Proxy !== 'function') {
        return false
    }

    if (!(window.InterNations && window.InterNations.enableXHRStats)) {
        return false
    }

    window.XMLHttpRequest = () => {
        const id = xhrStats.nextId++

        const stats = { state: 'config' }
        xhrStats.requests[id] = stats

        const request = new OrigXMLHttpRequest()
        const target = { request, id, stats, originalCallbacks: {} }

        // NOTE: remove with MapBox
        target.withCredentials = request.withCredentials

        setStateCallback(target, 'load', 'done')
        setStateCallback(target, 'error', 'error')
        setStateCallback(target, 'abort', 'aborted')

        return new Proxy(target, handler)
    }

    if (!window.app) {
        window.app = {}
    }

    window.app.xhrStats = xhrStats

    window.app.areXHRfinished = () =>
        xhrStats.requests
            .filter(req => req.state !== 'config' && req.state !== 'init' && req.state !== 'aborted')
            .every(req => req.state === 'done')

    return true
}
