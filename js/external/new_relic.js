import provideContext from 'service/context_provider'

const MOCK = {
    noticeError(error, attributes) {
        console.debug('Mocked NREUM.noticeError(%o, %o)', error, attributes) // eslint-disable-line no-console
    },
    setCustomAttribute(attribute, value) {
        console.debug('Mocked NREUM.setCustomAttribute(%o, %o)', attribute, value) // eslint-disable-line no-console
    },
    addRelease(releaseName, releaseId) {
        console.debug('Mocked NREUM.addRelease(%o, %o)', releaseName, releaseId) // eslint-disable-line no-console
    },
}

const init = () => {
    const NREUM = window.NREUM || MOCK

    Object.entries(provideContext()).forEach(([attr, val]) => NREUM.setCustomAttribute(attr, val))

    return NREUM
}

export default init()
