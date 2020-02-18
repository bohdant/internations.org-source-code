/* @flow */
import * as React from 'react'
import styled from 'styled-components'

import { COLOR_DARK_BLUE, COLOR_RED, COLOR_BLUE } from 'app/styles/colors'

import {
    USER_ROLE_NEWCOMER_BUDDY,
    USER_ROLE_ACTIVITY_GROUP_CONSUL,
    USER_ROLE_ADMIN,
    USER_ROLE_ALBATROSS,
    USER_ROLE_AMBASSADOR,
    USER_ROLE_USER,
    type UserMembership,
} from 'app/types'

import FontIcon, { getPixelSize, type IconSize } from './FontIcon'

const COLOR_MAP = {
    [USER_ROLE_ADMIN]: 'white',
    USER_ROLE_ADMIN_ALTERNATE: COLOR_DARK_BLUE,
    [USER_ROLE_AMBASSADOR]: COLOR_RED,
    [USER_ROLE_ACTIVITY_GROUP_CONSUL]: COLOR_DARK_BLUE,
    [USER_ROLE_NEWCOMER_BUDDY]: COLOR_DARK_BLUE,
    [USER_ROLE_ALBATROSS]: COLOR_BLUE,
    [USER_ROLE_USER]: 'white', // never used, but necessary for type checking
}

const ICON_TYPE_MAP = {
    [USER_ROLE_ADMIN]: 'albatross',
    USER_ROLE_ADMIN_ALTERNATE: 'logoAlbatross',
    [USER_ROLE_AMBASSADOR]: 'ambassador',
    [USER_ROLE_ACTIVITY_GROUP_CONSUL]: 'consul',
    [USER_ROLE_NEWCOMER_BUDDY]: 'newcomerBuddy',
    [USER_ROLE_ALBATROSS]: 'albatross',
    [USER_ROLE_USER]: 'albatross', // never used, but necessary for type checking
}

const getIconColor = (membership, isAlternateAdmin) =>
    COLOR_MAP[isAlternateAdmin ? 'USER_ROLE_ADMIN_ALTERNATE' : membership]

const getIconType = (membership, isAlternateAdmin) =>
    ICON_TYPE_MAP[isAlternateAdmin ? 'USER_ROLE_ADMIN_ALTERNATE' : membership]

const getBackgroundColor = (membership, isAlternateAdmin) =>
    membership === USER_ROLE_ADMIN && !isAlternateAdmin ? COLOR_DARK_BLUE : 'white'

const getBackgroundSize = iconSize => Math.round(10 * getPixelSize(iconSize) * 1.1) / 10

type PropTypes = {
    membership: UserMembership,
    size: IconSize,
    className?: ?string,
    dropShadow: boolean,
    ignoreClick?: boolean,
    isAlternateAdmin?: boolean,
}

const Background = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;

    background-color: ${props => props.color};
    ${props => (props.dropShadow ? 'box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25);' : '')};
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    border-radius: 50%;
    text-align: center;
`

const ignoreClickEvent = (evt: SyntheticEvent<HTMLElement>) => {
    evt.stopPropagation()
}

const MembershipIcon = ({ membership, size, className, dropShadow, ignoreClick, isAlternateAdmin }: PropTypes) => {
    if (membership === USER_ROLE_USER) {
        return null
    }

    return (
        <Background
            color={getBackgroundColor(membership, isAlternateAdmin)}
            size={getBackgroundSize(size)}
            className={className}
            dropShadow={dropShadow}
            onClick={ignoreClick ? ignoreClickEvent : null}
        >
            <FontIcon
                name={getIconType(membership, isAlternateAdmin)}
                color={getIconColor(membership, isAlternateAdmin)}
                size={size}
            />
        </Background>
    )
}

MembershipIcon.defaultProps = {
    size: 'standard',
    dropShadow: false,
}

export default MembershipIcon
