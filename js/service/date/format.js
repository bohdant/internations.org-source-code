/**
 * Date helper
 * equivalent to DateExtension.php
 *
 * All functions are timezone aware (default)
 * Disable timezone awareness if needed
 *
 * @example
 * formatTime('2011-07-26T11:42:09.000000Z', { timezoneAware = false })
 * // => '11:23'
 */

import moment from 'moment'
import invariant from 'invariant'
import { DateTime } from 'luxon'

/**
 *
 * @param date
 * @returns {string}
 * @example
 * formatTimeParseZone('2016-12-25T08:30:00+0600')
 * // => '08:30'
 */
export function formatTimeParseZone(date) {
    return moment.parseZone(date).format('HH:mm')
}

/**
 *
 * @param date
 * @returns {string}
 * @example
 * formatDateShortParseZone('2016-12-25T08:30:00+0600')
 * // => '25 Dec'
 */
export function formatDateShortParseZone(date) {
    return moment.parseZone(date).format('DD MMM')
}

/**
 *
 * @param date
 * @returns {string}
 * @example
 * formatDateTimeParseZone('2011-07-26T11:42:09+0600')
 * // => '26 Jul 2011 11:42'
 */
export function formatDateTimeParseZone(date) {
    return moment.parseZone(date).format('DD MMM YYYY HH:mm')
}

/**
 *
 * @param date
 * @returns {string}
 * @example
 * formatWeekdayParseZone('2011-07-26T11:42:09.000000Z')
 * // => 'Mon'
 */
export function formatWeekdayParseZone(date) {
    return moment.parseZone(date).format('ddd')
}

/**
 *
 * @param date
 * @param timezoneAware
 * @returns {string}
 * @example
 * formatTime('2011-07-26T11:42:09.000000Z')
 * // => '11:23'
 */
export function formatTime(date, { timezoneAware = true } = {}) {
    if (timezoneAware) {
        return moment(date)
            .utc()
            .format('HH:mm')
    }

    return moment(date)
        .local()
        .format('HH:mm')
}

/**
 *
 * @param date
 * @param timezoneAware
 * @returns {string}
 * @example
 * formatWeekday('2011-07-26T11:42:09.000000Z')
 * // => 'Mon'
 */
export function formatWeekday(date, { timezoneAware = true } = {}) {
    if (timezoneAware) {
        return moment(date)
            .utc()
            .format('ddd')
    }

    return moment(date)
        .local()
        .format('ddd')
}

/**
 *
 * @param date
 * @param timezoneAware
 * @returns {string}
 * @example
 * formatDateWeekday('2011-07-26T11:42:09.000000Z')
 * // => 'Mon 21 Jul'
 */
export function formatDateWeekday(date, { timezoneAware = true } = {}) {
    if (timezoneAware) {
        return moment(date)
            .utc()
            .format('ddd DD MMM')
    }

    return moment(date)
        .local()
        .format('ddd DD MMM')
}

/**
 *
 * @param date
 * @param timezoneAware
 * @returns {string}
 * @example
 * formatDateShort('2011-07-26T11:42:09.000000Z')
 * // => '21 Jul'
 */
export function formatDateShort(date, { timezoneAware = true } = {}) {
    if (timezoneAware) {
        return moment(date)
            .utc()
            .format('DD MMM')
    }

    return moment(date)
        .local()
        .format('DD MMM')
}

/**
 *
 * @param date
 * @param timezoneAware
 * @returns {string}
 * @example
 * formatDate('2011-07-26T11:42:09.000000Z')
 * // => '21 Jul 2011'
 */
export function formatDate(date, { timezoneAware = true } = {}) {
    const currentDate = moment()
    const givenDate = moment(date)

    if (timezoneAware) {
        if (currentDate.diff(givenDate, 'days') > 365) {
            return moment(date)
                .utc()
                .format('DD MMM YYYY')
        }

        return moment(date)
            .utc()
            .format('DD MMM')
    }

    if (currentDate.diff(givenDate, 'days') > 365) {
        return moment(date)
            .local()
            .format('DD MMM YYYY')
    }

    return moment(date)
        .local()
        .format('DD MMM')
}

/**
 *
 * @param date
 * @param timezoneAware
 * @returns {string}
 * @example
 * formatDateYear('2011-07-26T11:42:09.000000Z')
 * // => '21 Jul 2011'
 */
export function formatDateYear(date, { timezoneAware = true, fullMonth = false } = {}) {
    const token = fullMonth ? 'DD MMMM YYYY' : 'DD MMM YYYY'

    if (timezoneAware) {
        return moment(date)
            .utc()
            .format(token)
    }

    return moment(date)
        .local()
        .format(token)
}

/**
 *
 * @param date
 * @param timezoneAware
 * @returns {string}
 * @example
 * formatMonthYear('2011-07-26T11:42:09.000000Z')
 * // => 'July 2011'
 */
export function formatMonthYear(date, { timezoneAware = true } = {}) {
    const token = 'MMMM YYYY'

    if (timezoneAware) {
        return moment(date)
            .utc()
            .format(token)
    }

    return moment(date)
        .local()
        .format(token)
}

/**
 *
 * @param date
 * @param timezoneAware
 * @returns {string}
 * @example
 * formatDateTime('2011-07-26T11:42:09.000000Z')
 * // => '21 Jul 2011 11:23'
 */
export function formatDateTime(date, { timezoneAware = true } = {}) {
    if (timezoneAware) {
        return moment(date)
            .utc()
            .format('DD MMM YYYY HH:mm')
    }

    return moment(date)
        .local()
        .format('DD MMM YYYY HH:mm')
}

/**
 *
 * mostly used on wire components
 *
 * @param date
 * @param timezoneAware
 * @returns {string}
 * @example
 * formatHumanDateTime('2011-07-26T11:42:09.000000Z')
 * (today)      // => '11:23'
 * (yesterday)  // => '21 Jul 2011 at 11:23'
 * (a year ago) // => '21 Jul 2011'
 */
export function formatHumanDateTime(date, { timezoneAware = true } = {}) {
    const currentDate = moment()
    const givenDate = moment(date)

    if (currentDate.diff(givenDate, 'days') === 0) {
        return formatTime(date, { timezoneAware })
    }

    if (currentDate.diff(givenDate, 'years') >= 1) {
        return formatDate(date, { timezoneAware })
    }

    if (timezoneAware) {
        return `${moment(date)
            .utc()
            .format('DD MMM')} at ${moment(date)
            .utc()
            .format('HH:mm')}`
    }

    return `${moment(date)
        .local()
        .format('DD MMM')} at ${moment(date)
        .local()
        .format('HH:mm')}`
}

/**
 *
 * @param date
 * @returns {string}
 * @example
 * formatYear('2016-12-25T08:30:00+0600')
 * // => '2016'
 */
export function formatYear(date, { timezoneAware = true } = {}) {
    if (timezoneAware) {
        return moment(date)
            .utc()
            .format('YYYY')
    }

    return moment(date)
        .local()
        .format('YYYY')
}

export function formatDateWithPrecision({ dateTime, precision }, { fullMonth = true, timezoneAware = true } = {}) {
    invariant(
        dateTime && precision,
        'Trying to format a datetime with invalid parameters (dateTime = %s, precision = %s)',
        dateTime,
        precision
    )

    const myMoment = timezoneAware ? moment(dateTime).utc() : moment(dateTime).local()

    const PRECISION_FORMAT_MAP = {
        year: 'YYYY',
        month: fullMonth ? 'MMMM' : 'MMM',
        day: 'DD',
    }

    const PARTS_PRIORITY = ['day', 'month', 'year']
    const startingPoint = PARTS_PRIORITY.indexOf(precision)

    return PARTS_PRIORITY.slice(startingPoint)
        .map(part => myMoment.format(PRECISION_FORMAT_MAP[part]))
        .join(' ')
}

/**
 *
 * @param date valid ISO8601 string
 * @returns date with offset = 0
 */
export function formatDateNoTimeZone(date) {
    const luxonDate = DateTime.fromISO(date, { setZone: true })
    const rezoned = luxonDate.setZone('utc', { keepLocalTime: true })
    return rezoned.toString()
}
