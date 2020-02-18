function toString(message) {
    const type = typeof message

    if (['string', 'number'].includes(type)) {
        return message
    }

    if (type === 'function') {
        return message.toString()
    }

    if (message instanceof Promise) {
        return `Promise(${JSON.stringify(message)})`
    }

    return JSON.stringify(message)
}

function toError(error) {
    return error instanceof Error ? error : new Error(toString(error))
}

export { toError, toString }
