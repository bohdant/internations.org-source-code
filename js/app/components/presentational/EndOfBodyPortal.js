/* @flow */
import * as React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

const ViewportArea = styled.div`
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
`

type EndOfBodyPortalPropTypes = {
    onRef?: ?(?HTMLDivElement) => mixed,
    onClickOut?: ?(SyntheticMouseEvent<any>) => mixed,
}

export default class EndOfBodyPortal extends React.PureComponent<EndOfBodyPortalPropTypes> {
    // eslint-disable-next-line react/sort-comp
    hostDiv: ?HTMLElement

    constructor() {
        super()
        this.hostDiv = document.createElement('div')
    }

    componentDidMount() {
        if (!document.body || !this.hostDiv) {
            return
        }

        document.body.appendChild(this.hostDiv)
    }

    componentWillUnmount() {
        if (!document.body || !this.hostDiv) {
            return
        }

        document.body.removeChild(this.hostDiv)
    }

    onPopoverRef = (ref: ?HTMLDivElement) => {
        if (ref && this.props.onRef) {
            this.props.onRef(ref)
        }
    }

    onViewportAreaClick = (event: SyntheticMouseEvent<any>) => {
        const { onClickOut } = this.props
        event.stopPropagation()

        if (!onClickOut) {
            return
        }

        onClickOut(event)
    }

    render() {
        const { onClickOut } = this.props
        const { hostDiv, onPopoverRef, onViewportAreaClick } = this

        if (!hostDiv) {
            return null
        }

        const propsToPass = {
            ...this.props,
        }

        // don't pass our props down
        ;['onClickOut', 'onRef'].forEach(prop => delete propsToPass[prop])

        const popover = (
            <div ref={onPopoverRef} onClick={event => event.stopPropagation()} {...propsToPass} key="$popover" />
        )

        const popoverWithClickout = [<ViewportArea onClick={onViewportAreaClick} key="$clickoutArea" />, popover]

        return ReactDOM.createPortal(onClickOut ? popoverWithClickout : popover, hostDiv)
    }
}
