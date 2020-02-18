import { constant, identity, noop } from 'lodash'

const attempt = (f, ctx, ...params) => f.apply(ctx, params)

const MOCK = {
    addMetadata: noop,
    attempt,
    configure: constant(true),
    console: {
        debug: noop,
        error: noop,
        info: noop,
        log: noop,
        warn: noop,
    },
    removeMetadata: noop,
    track: noop,
    version: 'N/A',
    watch: attempt,
    watchAll: identity,
}

const init = () => window.TrackJS || MOCK

export default init()
