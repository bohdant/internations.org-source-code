// @flow
import * as React from 'react'

//  Missing use cases:
// - BlockLink as a button
// - blockLink-square
// https://issues.internations.org/browse/INOTF-1433

/**
 * @example
 *
 *  import BlockLink from 'app/components/presentational/BlockLink'
 *  <BlockLink href="/" icon="calendar">
 *      go to events
 *  </BlockLink>
 */

const BlockLink = ({ children, href, icon }: { children: React.Node, href: string, icon?: string }) => (
    <a className="blockLink" href={href}>
        {icon && <i className={`icon icon-large icon-${icon} icon-spaceRight`} />}
        {children}
    </a>
)

export default BlockLink
