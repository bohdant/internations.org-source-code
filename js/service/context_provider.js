import dataProvider from 'service/data_provider'
import correlationIdProvider from 'service/correlation_id_provider'
import { get } from 'lodash'

function provideContext() {
    const none = 'none'
    const urlName = 'urlName'
    const context = {
        user: get(dataProvider.get('currentUser'), 'id', 'anonymous'),
        currentLocalcommunity: get(dataProvider.get('currentLocalcommunity'), urlName, none),
        homeLocalcommunity: get(dataProvider.get('homeLocalcommunity'), urlName, none),
        route: dataProvider.get('route') || none,
        addrHash: dataProvider.get('addrHash') || none,
        correlationId: correlationIdProvider.get() || none,
    }

    Object.entries(dataProvider.get('experiments') || {}).forEach(([name, segment]) => {
        context[`experiment_${name}`] = segment
    })

    const deviceContext = dataProvider.get('deviceContext') || {}
    const transferDeviceContextValue = (sourceField, targetField, defaultValue) => {
        context[targetField] = get(deviceContext, sourceField, defaultValue) || defaultValue
    }

    transferDeviceContextValue('appBuild', 'deviceContextAppBuild', none)
    transferDeviceContextValue('appCodePush', 'deviceContextAppCodePush', none)
    transferDeviceContextValue('appName', 'deviceContextAppName', none)
    transferDeviceContextValue('appPlatform', 'deviceContextAppPlatform', none)
    transferDeviceContextValue('appPlatformVersion', 'deviceContextAppPlatformVersion', none)
    transferDeviceContextValue('appVersion', 'deviceContextAppVersion', none)
    transferDeviceContextValue('isWebView', 'deviceContextIsWebView', false)

    return context
}

export default provideContext
