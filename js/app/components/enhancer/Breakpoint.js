/* @flow */
/**
 * Do not use PureComponent for this component, it will block updates for the component it's wrapping.
 */
import { Component } from 'react'
import fastdom from 'fastdom'
import { debounce } from 'lodash'
import { BREAKPOINTS, BREAKPOINT_NAMES } from 'view/window'

type PropTypes = { children: Function }
type StateTypes = { breakpoint: any }

const getBreakpointName = (width: number) => {
    if (width < BREAKPOINTS.tablet) {
        return BREAKPOINT_NAMES.mobile
    } else if (width < BREAKPOINTS.desktop) {
        return BREAKPOINT_NAMES.tablet
    } else if (width < BREAKPOINTS.wideDesktop) {
        return BREAKPOINT_NAMES.desktop
    }

    return BREAKPOINT_NAMES.wideDesktop
}

export default class Breakpoint extends Component<PropTypes, StateTypes> {
    state = { breakpoint: getBreakpointName(window.innerWidth) }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize)
    }

    componentWillUnmount() {
        this.unmounted = true
        window.removeEventListener('resize', this.handleResize)
    }

    /**
     * Because handleResize is async we need to track wether the component is
     * still mounted before calling setState
     */
    unmounted = false

    handleResize = debounce(() => {
        fastdom.measure(() => {
            const breakpoint = getBreakpointName(window.innerWidth)
            if (breakpoint !== this.state.breakpoint && !this.unmounted) {
                this.setState({ breakpoint })
            }
        })
    }, 67)

    render() {
        return this.props.children(this.state)
    }
}
