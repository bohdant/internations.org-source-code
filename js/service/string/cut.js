/**
 * String cut service. Helps to cut string to exact length and add suffix if needed
 *
 * @example
 *
 *   // use default suffix
 *   cut(str, 100);
 *
 *   // use custom suffix
 *   cut(str, 70, '..more..');
 */

function cut(str, length, suffix) {
    if (typeof suffix === 'undefined') {
        suffix = '…'
    }

    if (str.length <= length) {
        return str
    }

    // cut the text and trim the spaces from the right
    str = str.slice(0, length).replace(/\s+$/, '')

    return str + suffix
}

export default cut
