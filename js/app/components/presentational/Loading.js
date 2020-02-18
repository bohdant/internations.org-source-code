/* @flow */
import * as React from 'react'

type PropTypes = {
    className?: ?string,
    expand: boolean,
}

const concatClassNames = (...classNames) => classNames.filter(Boolean).join(' ')

const Loading = ({ className, expand }: PropTypes) => (
    <div className={concatClassNames('spinner', expand && 'spinner-expandInContainer', className)} />
)

Loading.defaultProps = {
    expand: true,
}

export default Loading
