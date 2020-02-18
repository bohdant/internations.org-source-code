/* @flow */
import * as React from 'react'

const WhiteBox = ({
    noSpacing,
    children,
    style = {},
}: {
    noSpacing?: boolean,
    children: React.Node,
    style?: Object,
}): React.Node => (
    <div className={`whiteBox ${noSpacing ? 'whiteBox-noSpacing' : ''}`} style={style}>
        {children}
    </div>
)

export default WhiteBox
