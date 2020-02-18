/* @flow */

const makeNullArray = length => new Array(length).fill(null)

// $FlowFixMe v0.65 - not sure how to fix this, could be a Flow bug. It doesn't seem to like arrays that contain both 'real' objects and null. INSOCIAL-767
const mergeIntoArray = <T: null>(currentList: Array<?T>, [offset, limit, newData]: [number, number, Array<T>]) => {
    const firstSegment = currentList.slice(0, offset)
    const lastSegment = currentList.slice(offset + limit)

    const padBefore = firstSegment.length < offset ? makeNullArray(offset - firstSegment.length) : []
    const padAfter = newData.length < limit ? makeNullArray(limit - newData.length) : []

    return firstSegment.concat(padBefore, newData, padAfter, lastSegment)
}

export default mergeIntoArray
