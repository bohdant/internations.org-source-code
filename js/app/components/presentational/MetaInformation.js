/* @flow */
import * as React from 'react'

export default function MetaInformation({
    children,
    icon,
    onClick,
    className = '',
}: {
    children: React.Node,
    icon?: string,
    onClick?: Function,
    className?: string,
}) {
    let iconMarkup
    if (icon) {
        iconMarkup = (
            <span>
                <i className={`icon icon-small icon-${icon}-midGrey u-quarterSpaceRight icon-verticalAlignSub`} />
            </span>
        )
    }

    let childrenWrapper = children
    if (onClick) {
        childrenWrapper = (
            <button className="btn btn-link" onClick={onClick}>
                {children}
            </button>
        )
    }

    return (
        <div className={`metaInformation metaInformation-react ${className}`}>
            {iconMarkup}
            {childrenWrapper}
        </div>
    )
}
