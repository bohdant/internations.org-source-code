/* @flow */
import * as React from 'react'
import styled, { injectGlobal } from 'styled-components'
import getIconCode, { type IconName as OriginalIconName } from 'service/iconsFont'

import { COLOR_BLUE } from 'app/styles/colors'

// eslint-disable-next-line no-unused-expressions
injectGlobal`
    @font-face {
        font-family: 'Icons';
        src:
            url('/static/bundles/internationslayout/font/Icons/icons-v14.ttf') format('truetype'),
            url('/static/bundles/internationslayout/font/Icons/icons-v14.woff') format('woff');
        font-weight: normal;
        font-style: normal;
    }
`

export const PX_SIZE_MAP = {
    smaller: 14,
    small: 17,
    standard: 23,
    large: 27,
    larger: 32,
}

export type IconSize = $Keys<typeof PX_SIZE_MAP>
export type IconName = OriginalIconName

export type PropTypes = {
    name: IconName,
    className?: ?string,
    size: IconSize,
    color: string,
}

export const getPixelSize = (size: $Keys<typeof PX_SIZE_MAP>) => PX_SIZE_MAP[size]

const Container = styled.div`
    font-family: Icons;
    line-height: 1;
    font-size: ${props => props.size}px;
    color: ${props => props.color};
`

const FontIcon = ({ name, size, color, ...props }: PropTypes) => (
    <Container {...props} size={getPixelSize(size)} color={color}>
        {String.fromCharCode(getIconCode(name))}
    </Container>
)

FontIcon.defaultProps = {
    size: 'standard',
    color: COLOR_BLUE,
}

export default FontIcon
