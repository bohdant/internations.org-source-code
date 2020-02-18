/**
 * Assets service
 */

import dataProvider from 'service/data_provider'
import invariant from 'invariant'

const assetsInformation = dataProvider.get('assetsInformation')

invariant(assetsInformation != null, "Data provider lacks the 'assetsInformation' key.")

const assetsBaseUrl = assetsInformation.baseUrl
const assetsFormats = assetsInformation.formats
const assetsFormatsList = Object.keys(assetsFormats)

invariant(
    assetsBaseUrl != null,
    "No 'baseUrl' provided as part of the 'assetsInformation' structure in the data provider."
)
invariant(
    assetsFormats != null,
    "No 'formats' provided as part of the 'assetsInformation' structure in the data provider."
)

/**
 * Validates format for correctness, checks the presence of provided format in the list of available
 *
 * @param  {String} format Image format
 */
function _validateFormat(format) {
    if (typeof format === 'undefined') {
        throw new Error('Format is not specified')
    }

    if (typeof format !== 'string') {
        throw new Error('Format should be a string')
    }

    if (assetsFormatsList.indexOf(format) === -1) {
        throw new Error('Specified format is not listed in available')
    }
}

/**
 * Get prefix for assets format
 *
 * @param {String} format Image format string
 *
 * @return {String}
 */
function prefix(format) {
    _validateFormat(format)

    return assetsBaseUrl + assetsFormats[format]
}

/**
 * Possible replacements:
 *
 * @param {String} url            Image url
 * @param {Object} options        Options object
 * @param {String} options.format Format (size) of the image
 *
 * @return {String} Image url
 *
 * @example
 *
 *   assets.getImageUrl('https://assets.in-cdn.net/image/{format}/2015/08/13/hello.jpg', { format: '100_100' });
 *   // => https://assets.in-cdn.net/image/100_100/2015/08/13/hello.jpg
 */
function getImageUrl(url, options = {}) {
    if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided')
    }

    _validateFormat(options.format)

    return url.replace('{format}', options.format)
}

/**
 * Gets static image url
 *
 * @param  {String} path Path to image inside of Layout Bundle
 * @return {String}      Image url
 *
 * @example
 *
 *     assets.getStaticImageUrl('/teaser/empty_event@2x.jpg')
 *     // => /static/bundles/internationslayout/frontend/images/teaser/empty_event@2x.jpg
 */
function getStaticImageUrl(path) {
    if (path.charAt(0) !== '/') {
        throw new Error('Static image path should start with slash')
    }

    const assetsBasePath = '/static/bundles/internationslayout/frontend/images'

    return assetsBaseUrl + assetsBasePath + path
}

export default {
    prefix,
    getImageUrl,
    getStaticImageUrl,
}
