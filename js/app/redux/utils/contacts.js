/* @flow */
export const storageKey = ({ userId, ...params }: Object) => {
    const filterKeys = ['term', 'gender', 'country'].sort()
    const filterParts = filterKeys.reduce((acc, key) => {
        const value = params[key]

        if (!value) {
            return acc
        }

        return acc.concat([`${key}=${value}`])
    }, [])

    const filter = filterParts.length > 0 ? filterParts.join(',') : 'all'

    return `${userId}:${filter}`
}
