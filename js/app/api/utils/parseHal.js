import lodash from 'lodash'

const isCollection = json => json && json._embedded && json._embedded.self

function flattenCollection(json) {
    return {
        meta: lodash.omit(json, '_embedded'),
        list: json._embedded.self,
    }
}

function flattenEntity(json) {
    // Don't process if primitive type or _embedded key is missing
    if (json === null || typeof json !== 'object' || !json._embedded) {
        return json
    }

    const embedded = {}
    Object.keys(json._embedded).forEach(key => {
        const prop = json._embedded[key]
        embedded[key] = parseHal(prop)
    })

    return Object.assign({}, lodash.omit(json, '_embedded'), embedded)
}

/**
 * Parses a JSON structure in HAL format, and returns an object with:
 * - `_embedded` entities flattened into their parent entity
 * - collections flattened into a more sane structure, without the nested `_embedded` property.
 *
 * PLEASE NOTE:
 * Only parses 1-level deep. If we ever need to parse deeper than that,
 * parseHal has to be modified.

 * @param  {object} json - The HAL object to parse.
 * @return {object}      - The parsed resulting object.
 */
export default function parseHal(json) {
    if (isCollection(json)) {
        return flattenCollection(json)
    }

    return flattenEntity(json)
}
