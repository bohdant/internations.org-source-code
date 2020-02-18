// @flow
import styled from 'styled-components'

/**
 * This can be refactored into ReactCSSTransitionGroup (the right way to achieve transitions in React)
 * follow up ticket: https://issues.internations.org/browse/INGROWTH-914
 */
const AnimateOut = styled.div`
    transition: all 0.8s ease-in-out;

    overflow: hidden;
    transform: ${({ out }) => (out ? 'scale3d(0.7, 0.7, 0.7)' : 'scale3d(1,1,1)')};
    max-height: ${({ out }) => (out ? '0px' : '600px')};
    opacity: ${({ out }) => (out ? '0' : '1')};
`

export default AnimateOut
