/**
 * Pluralize helper
 *
 * @example
 *
 * pluralize(5, 'answer', 'answers');
 * // => "5 answers"
 *
 * pluralize(1, 'answer', 'answers');
 * // => "1 answer"
 *
 * pluralize(0, 'answer', 'answers');
 * // => "0 answers"
 *
 * pluralize(0, 'answer', 'answers', 'no answers');
 * // => "no answers"
 */

function pluralize(number, singular, plural, zero) {
    // zero
    if (number === 0 && typeof zero !== 'undefined') {
        return zero
    }

    if (number === 1) {
        return `${number} ${singular}`
    }

    return `${number} ${plural}`
}

export default pluralize
