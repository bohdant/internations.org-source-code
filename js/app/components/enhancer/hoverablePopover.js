/* @flow */
import * as React from 'react'
import { pick, omit } from 'lodash'
import invariant from 'invariant'
import Popper from 'popper.js'
import getDisplayName from 'app/components/utils/getDisplayName'

import If from 'app/components/presentational/If'
import EndOfBodyPortal from 'app/components/presentational/EndOfBodyPortal'

const STATES = {
    AWAITING_CLOSING: 'AWAITING_CLOSING',
    AWAITING_OPENING: 'AWAITING_OPENING',
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
}

const ACTIONS = {
    MAKE_REQUEST_OPEN: 'MAKE_REQUEST_OPEN',
    RESCIND_REQUEST_OPEN: 'RESCIND_REQUEST_OPEN',
    OPEN_TIMER_EXPIRED: 'OPEN_TIMER_EXPIRED',
    CLOSE_TIMER_EXPIRED: 'CLOSE_TIMER_EXPIRED',
    POPOVER_MOUSE_OVER: 'POPOVER_MOUSE_OVER',
    POPOVER_MOUSE_OUT: 'POPOVER_MOUSE_OUT',
}

const isCardVisible = currentState => currentState === STATES.OPEN || currentState === STATES.AWAITING_CLOSING

const TRANSITION_MATRIX = {
    [STATES.CLOSED]: {
        [ACTIONS.MAKE_REQUEST_OPEN]: STATES.AWAITING_OPENING,
    },
    [STATES.AWAITING_OPENING]: {
        [ACTIONS.RESCIND_REQUEST_OPEN]: STATES.CLOSED,
        [ACTIONS.OPEN_TIMER_EXPIRED]: STATES.OPEN,
    },
    [STATES.OPEN]: {
        [ACTIONS.POPOVER_MOUSE_OUT]: STATES.AWAITING_CLOSING,
        [ACTIONS.RESCIND_REQUEST_OPEN]: STATES.AWAITING_CLOSING,
    },
    [STATES.AWAITING_CLOSING]: {
        [ACTIONS.POPOVER_MOUSE_OVER]: STATES.OPEN,
        [ACTIONS.MAKE_REQUEST_OPEN]: STATES.OPEN,
        [ACTIONS.CLOSE_TIMER_EXPIRED]: STATES.CLOSED,
    },
}

// Flow wants to have a full matrix, no way!
// $FlowFixMe v0.66
const computeNextState = (currentState, action) => TRANSITION_MATRIX[currentState][action]

// NOTE: update array in the render method if you change this
export type PropTypes = {
    HostComponent: React.ElementType,
    children: React.Node,
    closeDelay: number,
    fetchMarkup: () => mixed,
    markup: ?string,
    openDelay: number,
    refProp: string,
    disablePopover: boolean,
    oneAtATime: boolean,
    portalStyle?: ?Object,
}

type State = {
    automataState: $Values<typeof STATES>,
    bindingData: ?{ styles: Object },
}

const hoverablePopover = <T: Object>({
    PopoverComponent,
    popoverPropNames = [],
    defaultProps = {},
    bindingModifiers = {},
    placement = 'top',
}: {
    PopoverComponent: React.ComponentType<T>,
    popoverPropNames?: string[],
    defaultProps?: Object,
    bindingModifiers?: Object,
    placement?: string,
}) => {
    class HoverablePopover extends React.PureComponent<PropTypes, State> {
        /* eslint-disable react/sort-comp */
        binding: ?typeof Popper
        closingTimer: ?TimeoutID
        openingTimer: ?TimeoutID
        portalRef: ?HTMLDivElement
        wrapperRef: ?HTMLDivElement
        /* eslint-enable react/sort-comp */

        static defaultProps = {
            disablePopover: false,
            HostComponent: 'div',
            refProp: 'ref',
            openDelay: 0,
            closeDelay: 0,
            oneAtATime: false,
            ...defaultProps,
        }

        state = { automataState: STATES.CLOSED, bindingData: null }

        componentWillMount() {
            this.runInvariants(this.props)
        }

        compoonentWillUnmount() {
            this.cancelTimers()
        }

        componentWillReceiveProps(nextProps: PropTypes) {
            this.runInvariants(nextProps)
        }

        componentDidUpdate(prevProps: PropTypes, prevState: State) {
            const { automataState } = this.state
            const { automataState: prevAutomataState } = prevState

            if (automataState !== prevAutomataState) {
                this.enterState(automataState)
            }

            if (isCardVisible(automataState) !== isCardVisible(prevAutomataState)) {
                this.updateBinding()
            }
        }

        runInvariants = (props: PropTypes) => {
            const { openDelay, closeDelay, oneAtATime } = props

            invariant(
                // oneAtATime implies openDelay >= closeDelay
                !oneAtATime || openDelay >= closeDelay,
                `HoverablePopover has been initialized with a 'openDelay' (${openDelay} ms) that is less than the 'closeDelay' (${closeDelay} ms). This can lead to multiple popovers visibile at the same time on the screen for a period of ${closeDelay -
                    openDelay} ms.`
            )
        }

        updateBinding = () => {
            const { wrapperRef, portalRef } = this
            const { automataState } = this.state
            const open = isCardVisible(automataState)

            if (!wrapperRef || !portalRef) {
                this.destroyBinding()

                return
            }

            if (!open) {
                this.destroyBinding()
                return
            }

            this.binding = new Popper(wrapperRef, portalRef, {
                placement,
                removeOnDestroy: false,
                onCreate: bindingData => this.setState({ bindingData }),
                onUpdate: bindingData => this.setState({ bindingData }),
                modifiers: {
                    ...bindingModifiers,
                    applyStyle: { enabled: false },
                },
            })
        }

        destroyBinding = () => {
            if (!this.binding) {
                return
            }

            this.binding.destroy()

            this.setState({ bindingData: null })

            this.binding = null
        }

        dispatch = (action: $Values<typeof ACTIONS>) => {
            const nextState = computeNextState(this.state.automataState, action)

            if (!nextState) {
                return
            }

            this.setState({ automataState: nextState })
        }

        enterState = (state: $Values<typeof STATES>) => {
            const functionMap = {
                [STATES.CLOSED]: this.enterStateClosed,
                [STATES.OPEN]: this.enterStateOpen,
                [STATES.AWAITING_OPENING]: this.enterStateAwaitingOpening,
                [STATES.AWAITING_CLOSING]: this.enterStateAwaitingClosing,
            }

            const f = functionMap[state]

            if (!f) {
                return
            }

            return f()
        }

        cancelTimers = () => {
            const { openingTimer, closingTimer } = this

            if (openingTimer) {
                clearTimeout(openingTimer)
                this.openingTimer = null
            }

            if (closingTimer) {
                clearTimeout(closingTimer)
                this.closingTimer = null
            }
        }

        enterStateOpen = () => {
            this.cancelTimers()
        }

        enterStateClosed = () => {
            this.cancelTimers()
        }

        enterStateAwaitingOpening = () => {
            const { openDelay } = this.props

            this.openingTimer = setTimeout(() => {
                this.dispatch(ACTIONS.OPEN_TIMER_EXPIRED)
            }, openDelay)
        }

        enterStateAwaitingClosing = () => {
            const { closeDelay } = this.props

            this.closingTimer = setTimeout(() => {
                this.dispatch(ACTIONS.CLOSE_TIMER_EXPIRED)
            }, closeDelay)
        }

        onPortalRef = (ref: ?HTMLDivElement) => {
            this.portalRef = ref

            this.updateBinding()
        }

        onWrapperRef = (ref: ?HTMLDivElement) => {
            this.wrapperRef = ref

            this.updateBinding()
        }

        onHostMouseOver = () => {
            this.dispatch(ACTIONS.MAKE_REQUEST_OPEN)
        }

        onHostMouseOut = () => {
            this.dispatch(ACTIONS.RESCIND_REQUEST_OPEN)
        }

        onPopoverMouseOver = () => {
            this.dispatch(ACTIONS.POPOVER_MOUSE_OVER)
        }

        onPopoverMouseOut = () => {
            this.dispatch(ACTIONS.POPOVER_MOUSE_OUT)
        }

        render() {
            const { onHostMouseOver, onHostMouseOut, onPopoverMouseOver, onPopoverMouseOut } = this
            const { HostComponent, refProp, children, disablePopover, portalStyle, ...rest } = this.props
            const { automataState, bindingData } = this.state

            const hostProps = omit(rest, popoverPropNames.concat(['openDelay', 'closeDelay', 'oneAtATime']))
            const popoverProps = pick(rest, popoverPropNames)

            if (disablePopover) {
                return <HostComponent {...hostProps}>{children}</HostComponent>
            }

            return (
                <HostComponent
                    onMouseOver={onHostMouseOver}
                    onMouseOut={onHostMouseOut}
                    {...{ [refProp]: this.onWrapperRef, ...hostProps }}
                >
                    {children}
                    <If condition={isCardVisible(automataState)}>
                        <EndOfBodyPortal
                            onRef={this.onPortalRef}
                            style={{ ...(bindingData || {}).styles, ...portalStyle }}
                            onMouseOver={onPopoverMouseOver}
                            onMouseOut={onPopoverMouseOut}
                        >
                            <PopoverComponent {...popoverProps} />
                        </EndOfBodyPortal>
                    </If>
                </HostComponent>
            )
        }
    }

    HoverablePopover.displayName = `HoverablePopover(${getDisplayName(PopoverComponent)})`

    return HoverablePopover
}

export default hoverablePopover
