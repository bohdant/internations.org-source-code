/**
 * Logger
 *
 * Logs messages in production, stage or development to various backends
 *
 * Log levels follow syslogs log levels (http://tools.ietf.org/html/rfc5424#page-11) and are stolen from PHPs
 * PSR-3. Go here for an explanation of the log levels:
 * https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-3-logger-interface.md#3-psrlogloggerinterface
 *
 * @example
 *   // Simple debug message
 *   Logger.debug("message");
 *
 *   // With special context
 *   Logger.error("message", { key: "value" });
 *
 *   // Different levels
 *   Logger.emergency('emergency message');
 *   Logger.alert('alert message');
 *   Logger.critical('critical message');
 *   Logger.error('error message');
 *   Logger.warning('error message');
 *   Logger.notice('notice message');
 *   Logger.info('info message');
 *   Logger.debug('debug message');
 */
import _ from 'lodash'
import dataProvider from 'service/data_provider'
import NREUM from 'external/new_relic'
import TrackJS from 'external/trackjs'
import { toError, toString } from 'service/to_error'
import provideContext from 'service/context_provider'

const CONSOLE_MAPPING = {
    warning: 'warning',
    alert: 'error',
    critical: 'error',
    emergency: 'error',
    notice: 'info',
}

function logToTrackJs({ level, description, context }) {
    TrackJS.console.info({ level, ...context })
    TrackJS.track(description)

    return { level, description, context }
}

function logToNewRelic({ level, description, context }) {
    NREUM.noticeError(toError(description), { level, ...context })

    return { level, description, context }
}

function logToConsole({ level, description, context }) {
    const method = CONSOLE_MAPPING[level] || level

    /* eslint-disable no-console */
    if (console[method]) {
        const args = [formatDescription(level, description)]
        if (!_.isEmpty(context)) {
            args.push(context)
        }
        console[method](...args)
    }
    /* eslint-enable no-console */

    return { level, description, context }
}

function logHome({ level, description, context }) {
    const log = window.interNationsLog || (() => {})

    log(level, formatDescription(level, toString(description)), context)

    return { level, description, context }
}

function enrichContext({ context, ...rest }) {
    context = { ...context, ...provideContext() }

    return { context, ...rest }
}

const formatDescription = (level, description) => `[${level.toUpperCase()}] ${description}`

const filterLevel = (minLevel, logFn) => ({ level, ...rest }) =>
    levels.indexOf(minLevel) >= levels.indexOf(level) ? logFn({ level, ...rest }) : { level, ...rest }

const trackJsLogger = filterLevel('error', logToTrackJs)
const newRelicLogger = filterLevel('error', logToNewRelic)

/** Configuration & setup */
const LOGGER_ADAPTER_CONFIGURATION = {
    prod: [newRelicLogger, trackJsLogger, logHome],
    stage: [newRelicLogger, trackJsLogger, logHome],
    default: [newRelicLogger, logToConsole, logHome],
}
const environment = dataProvider.get('environment')
const adapters = LOGGER_ADAPTER_CONFIGURATION[environment] || LOGGER_ADAPTER_CONFIGURATION.default
const log = _.flowRight(...adapters, enrichContext)

const levels = ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug']

const Logger = levels.reduce((acc, level) => {
    acc[level] = (description, context = {}) => log({ level, description, context })
    return acc
}, {})

export default Logger
