const data =
    typeof window !== 'undefined' &&
    typeof window.InterNations === 'object' &&
    typeof window.InterNations.data === 'object'
        ? window.InterNations.data
        : {}

const dataProvider = {
    get(key) {
        return data[key]
    },

    getAll() {
        return data
    },

    set(key, value) {
        data[key] = value
    },

    has(key) {
        return key in data
    },
}

export default dataProvider
