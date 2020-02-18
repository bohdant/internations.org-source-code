/* @flow */
import * as React from 'react'
import styled from 'styled-components'

import MembershipIcon from 'app/components/presentational/MembershipIcon'
import { getHighestMembershipForUser } from 'app/redux/utils/membership'
import hoverablePopover from 'app/components/enhancer/hoverablePopover'
import Breakpoint from 'app/components/enhancer/Breakpoint'

import { COLOR_DARK_BLUE, COLOR_BLUE } from 'app/styles/colors'
import { ZINDEX_ROLE_TOOLTIP } from 'app/styles/zIndex'
import { type IconSize } from 'app/components/presentational/FontIcon'

import googleAnalytics from 'service/google_analytics'

import {
    USER_ROLE_NEWCOMER_BUDDY,
    USER_ROLE_ACTIVITY_GROUP_CONSUL,
    USER_ROLE_ADMIN,
    USER_ROLE_ALBATROSS,
    USER_ROLE_AMBASSADOR,
    USER_ROLE_USER,
    type User,
    type GATrackingCustomVars,
} from 'app/types'

const getBorderColor = membership => (membership === USER_ROLE_ADMIN ? COLOR_DARK_BLUE : COLOR_BLUE)

const HoverBorder = styled.div`
    border-radius: 50%;
    cursor: help;
    padding: 2px;

    &:hover {
        background-color: ${props => props.color};
    }
`

const InnerWrapper = styled.div`
    display: block;
    position: relative;
    top: auto;
    right: auto;
`

const MEMBERSHIP_TOOLTIP_MAP = {
    [USER_ROLE_USER]: {},
    [USER_ROLE_ADMIN]: {
        link: '/team/',
        text: 'Works at InterNations :-)',
        title: 'InterNations Team Member',
    },
    [USER_ROLE_AMBASSADOR]: {
        link: '/get-involved/internations-ambassador/',
        text: 'Organizes and hosts the InterNations Official Events.',
        title: 'InterNations Ambassador',
    },
    [USER_ROLE_ACTIVITY_GROUP_CONSUL]: {
        link: '/get-involved/internations-consul/',
        text: 'Hosts monthly activities for one or more InterNations Groups.',
        title: 'InterNations Consul',
    },
    [USER_ROLE_NEWCOMER_BUDDY]: {
        link: '',
        text: 'Welcomes new members on InterNations.',
        title: 'InterNations Newcomers’ Buddy',
    },
    [USER_ROLE_ALBATROSS]: {
        link: '/membership/',
        text: 'Enjoys all the benefits of our premium membership for a small fee.',
        title: 'Albatross Member',
    },
}

class BasePopover extends React.PureComponent<{
    user: User,
    tooltipText: ?string,
    tooltipLinkRef?: string,
    tooltipTrackingCustomVariables?: GATrackingCustomVars,
}> {
    // eslint-disable-next-line react/sort-comp
    learnMoreLink: ?HTMLAnchorElement = undefined

    handleLearnMoreRef = learnMoreLink => {
        this.learnMoreLink = learnMoreLink
    }

    onLearnMoreClick = (evt: SyntheticMouseEvent<HTMLAnchorElement>) => {
        const { tooltipTrackingCustomVariables } = this.props

        // This conditional is only necessary to appease Flow (as of v0.66)
        // This handler won't ever be called unless both of these are defined
        if (!tooltipTrackingCustomVariables || !this.learnMoreLink) {
            // Allow the link to still function like usual
            return true
        }

        const url = this.learnMoreLink.href

        evt.preventDefault()

        googleAnalytics.setCustomVar(
            tooltipTrackingCustomVariables.index,
            tooltipTrackingCustomVariables.name,
            tooltipTrackingCustomVariables.value,
            tooltipTrackingCustomVariables.scope
        )

        // Give the tracking 100ms to complete, then navigate to the URL
        setTimeout(() => {
            window.location.href = url
        }, 100)
    }

    render() {
        const { user, tooltipText, tooltipLinkRef, tooltipTrackingCustomVariables } = this.props
        const membership = getHighestMembershipForUser(user)
        const { localcommunityName } = user

        if (!membership) {
            return null
        }

        const { link, text } = MEMBERSHIP_TOOLTIP_MAP[membership]
        let { title } = MEMBERSHIP_TOOLTIP_MAP[membership]

        if (localcommunityName && membership === USER_ROLE_AMBASSADOR) {
            title += ` ${localcommunityName} Community`
        }

        // Add tracking to the 'Learn More' link, if provided
        const learnMoreLinkProps = {
            href: `${link}${tooltipLinkRef ? `?ref=${tooltipLinkRef}` : ''}`,
            onClick: undefined,
            ref: undefined,
        }

        if (tooltipTrackingCustomVariables) {
            learnMoreLinkProps.onClick = this.onLearnMoreClick
            learnMoreLinkProps.ref = this.handleLearnMoreRef
        }

        // Create contents of the popover
        const content = (
            <span className="membershipTooltip__text">
                {title ? <span className="membershipTooltip__textTitle">{title}</span> : null}
                {tooltipText || text || ''}
                {link ? (
                    <div>
                        <br />
                        <a {...learnMoreLinkProps}>Learn more</a>
                    </div>
                ) : null}
            </span>
        )

        return (
            <InnerWrapper className="popover popover-membershipIconTooltip right in">
                <div className="arrow" />
                <div className="popover-inner">
                    <div className="popover-content">
                        <div>{content}</div>
                    </div>
                </div>
            </InnerWrapper>
        )
    }
}

const Popover = hoverablePopover({
    PopoverComponent: BasePopover,
    popoverPropNames: ['user', 'tooltipText', 'tooltipLinkRef', 'tooltipTrackingCustomVariables'],
    defaultProps: {
        closeDelay: 250,
        portalStyle: {
            zIndex: ZINDEX_ROLE_TOOLTIP,
        },
    },
    placement: 'right',
    bindingModifiers: {
        flip: { enabled: false },
    },
})

// Enhancer that responds to the current breakpoint
const ResponsiveRoleIcon = ({ noTooltip, ...props }: { ...PropTypes, noTooltip?: boolean }) => (
    <Breakpoint>
        {({ breakpoint }) => (
            <RoleIcon {...props} noTooltip={typeof noTooltip !== 'boolean' ? breakpoint === 'mobile' : noTooltip} />
        )}
    </Breakpoint>
)

export type PropTypes = {
    user: User,
    size: IconSize,
    noTooltip: boolean,
    tooltipText?: ?string,
    tooltipLinkRef?: ?string,
    ignoreClick?: boolean,
    tooltipTrackingCustomVariables?: GATrackingCustomVars,
    isAlternateAdmin?: boolean,
}

const RoleIcon = ({
    user,
    size,
    noTooltip,
    tooltipText,
    tooltipLinkRef,
    ignoreClick,
    tooltipTrackingCustomVariables,
    isAlternateAdmin,
}: PropTypes) => {
    const membership = getHighestMembershipForUser(user)

    if (!membership) {
        return null
    }

    const membershipIcon = (
        <MembershipIcon
            membership={membership}
            size={size}
            ignoreClick={ignoreClick}
            isAlternateAdmin={isAlternateAdmin}
        />
    )

    if (noTooltip) {
        return membershipIcon
    }

    return (
        <Popover
            HostComponent={HoverBorder}
            refProp="innerRef"
            color={getBorderColor(membership)}
            user={user}
            tooltipText={tooltipText}
            tooltipLinkRef={tooltipLinkRef}
            tooltipTrackingCustomVariables={tooltipTrackingCustomVariables}
        >
            {membershipIcon}
        </Popover>
    )
}

RoleIcon.defaultProps = {
    noTooltip: false,
    size: 'standard',
}

export default ResponsiveRoleIcon
