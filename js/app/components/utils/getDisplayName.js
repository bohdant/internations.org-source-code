/* @flow */

export default function getDisplayName(Component: Object): string {
    return Component.displayName || Component.name || 'Component'
}
