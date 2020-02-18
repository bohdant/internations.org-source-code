/**
 * Removes all doubled white spaces and line breaks from a string.
 *
 * Example: Useful if you want to make sure template output can be directly
 * followed by another character. (E.g. user names that are followed by ":".)
 */

export default function(str) {
    return str.replace(/\s\s+|\r|\n/g, '')
}
