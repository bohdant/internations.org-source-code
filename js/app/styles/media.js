/* @flow */
import { css } from 'styled-components'
import { BREAKPOINTS } from 'view/window'
import windowView from 'shared/view/window'

const jsDrivenConditionalCSS = condition => (...args: mixed) => condition && css(...args)

const media: { [$Keys<BREAKPOINTS>]: Function } = Object.entries(BREAKPOINTS).reduce((acc, [name, minWidth]) => {
    acc[name] = (...args) =>
        css`
            @media (min-width: ${minWidth}px) {
                ${css(...args)};
            }
        `
    return acc
}, {})

// Same as above, but for max-width media queries
export const mediaMaxWidth: { [$Keys<BREAKPOINTS>]: Function } = Object.entries(BREAKPOINTS).reduce(
    (acc, [name, minWidth]) => {
        // $FlowFixMe v0.66
        const maxWidth = `${minWidth - 1}`
        acc[name] = (...args) =>
            css`
                @media (max-width: ${maxWidth}px) {
                    ${css(...args)};
                }
            `
        return acc
    },
    {}
)

export const deviceClass = {
    ios: jsDrivenConditionalCSS(windowView.isIOSDevice()),
    android: jsDrivenConditionalCSS(windowView.isAndroidDevice()),
    webview: jsDrivenConditionalCSS(windowView.isWebView()),
}

export default media
