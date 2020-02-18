import dataProvider from '../service/data_provider'

function renderRecruitingConsoleAd(log) {
    if (dataProvider.get('environment') === 'dev') {
        return
    }

    const css = styles => styles.join(';')

    const base = ['background-color: #f5f6f7', 'font-family: sans-serif']
    const titleBase = base.concat(['padding: 16px', 'line-height: 108px', 'font-size: 72px', 'font-weight: bold'])
    const titleText = titleBase.concat(['color: #0e3247'])
    const titleHeart = titleBase.concat(['color: #f24011'])
    const text = base.concat(['color: #333333', 'font-size: 30px', 'padding: 8px'])

    log('%cWe %c♥ %cengineering!', css(titleText), css(titleHeart), css(titleText))
    log('%cBecome a Software Engineer at InterNations', css(text))
    log('%cFind out more at https://www.internations.org/career?source=console-log', css(text))
}

export default () => {
    try {
        renderRecruitingConsoleAd(console.log) // eslint-disable-line no-console
    } catch (e) {
        // Ignore
    }
}
