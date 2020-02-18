/* @flow */
import cookieStorage from 'service/cookie_storage'

const COOKIE_NAME = '__indbg'

export default {
    get(): ?string {
        return cookieStorage.get(COOKIE_NAME)
    },
}
