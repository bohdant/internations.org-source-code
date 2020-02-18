// @flow
import React, { Fragment, PureComponent } from 'react'
import styled from 'styled-components'

import type { User } from 'app/types'
import { trackEvent } from 'app/api/index'
import { GUTTER, HALF_GUTTER, QUARTER_GUTTER } from 'app/styles/sizes'
import { COLOR_GREY90 } from 'app/styles/colors'

import Checkbox from 'app/components/presentational/Checkbox'
import UserPhoto from 'app/components/presentational/UserPhoto'
import FlagItem from 'app/components/presentational/FlagItem'
import MetaInfo from 'app/components/presentational/MetaInformation'
import userImagePlaceholder from 'app/components/enhancer/userImagePlaceholder'

const TeaserWrapper = styled.div`
    display: flex;
    padding: ${GUTTER} ${HALF_GUTTER};

    &:not(:last-child) {
        border-bottom: 1px ${COLOR_GREY90} solid;
    }
`

// Once the UserPhoto (https://issues.internations.org/browse/INOTF-1399) is refactored, remove the 56pxin this rule.
const UserPhotoWrapper = styled.div`
    width: 56px;
    height: 56px;
    margin-right: ${HALF_GUTTER};
    flex-shrink: 0;
`
const UserDataWrapper = styled.div`
    min-width: 0;
    flex-basis: 0;
    flex-grow: 1;
`

const FlagItemWrapper = styled.div`
    margin-right: ${QUARTER_GUTTER};
`

const FlagsWrapper = styled.div`
    display: flex;
    width: 100%;
`

const ClampMetaInfo = styled(MetaInfo)`
    /*  This is twice the line height of the MetaInfo, needs to be here in order to
        ellipsize the interests properly.
    */
    max-height: 36px;
    overflow: hidden;
`

type PropTypes = {
    user: User,
    isChecked: boolean,
    toggleSuggestion: Function,
    className?: string,
}

class SuggestionTeaser extends PureComponent<PropTypes> {
    defaultProps = {
        className: '',
    }

    componentDidMount() {
        trackEvent({
            eventType: 'ONBOARDING_CONTACT_NEW_USERS_PROFILE_DISPLAYED',
            params: { displayedUserId: this.props.user.id },
        })

        if (this.interestsRef) {
            this.clampInterests()
            window.addEventListener('resize', this.clampInterests)
        }
    }

    componentWillUnmount() {
        if (this.interestsRef) {
            window.removeEventListener('resize', this.clampInterests)
        }
    }

    onToggleSuggestion = () => {
        this.props.toggleSuggestion(this.props.user.id)
    }

    setInterestRef = ref => {
        this.interestsRef = ref
    }

    interestsRef: ?HTMLSpanElement

    clampInterests = () => {
        const { interestsRef } = this
        if (this.props.user.interests && interestsRef) {
            const interests = this.props.user.interests.join(', ')
            interestsRef.innerHTML = `Interested in: ${interests}`

            // $FlowFixMe parentElement is an HTMLElement and does have an offsetHeight property
            while (interestsRef.offsetHeight > interestsRef.parentElement.offsetHeight) {
                interestsRef.innerHTML = interestsRef.innerHTML.replace(/\W*\s(\S)*$/, '...')
            }
        }
    }

    renderMetaInfo = () => {
        const { user } = this.props

        if (user.interests && user.interests.length > 3) {
            const interests = user.interests.join(', ')
            return (
                <ClampMetaInfo>
                    <span ref={this.setInterestRef}>Interested in: {interests}</span>
                </ClampMetaInfo>
            )
        }

        return (
            <Fragment>
                <MetaInfo className="u-textEllipsis">Born in: {user.origin.city}</MetaInfo>
                <MetaInfo className="u-textEllipsis">Living in: {user.residency.city}</MetaInfo>
            </Fragment>
        )
    }

    render() {
        const { user, isChecked, className } = this.props
        const hasInterests = user.interests && user.interests.length > 3

        return (
            <TeaserWrapper className="t-newcomer-suggestions">
                <UserPhotoWrapper>
                    <UserPhoto suppressMagnifier noTooltip isCircle user={user} iconSize="standard" />
                </UserPhotoWrapper>
                <UserDataWrapper className={!hasInterests ? 'u-textEllipsis' : ''}>
                    <div className="u-spaceBetween">
                        <a href={`/profile/${user.id}`} className="teaserTitle u-block u-textEllipsis">
                            {user.firstName} {user.lastName}
                        </a>
                        <Checkbox
                            name={`suggestion-${user.id}`}
                            value={`suggestion-${user.id}`}
                            className={className}
                            isChecked={isChecked}
                            onChange={this.onToggleSuggestion}
                        />
                    </div>
                    <FlagsWrapper>
                        <FlagItemWrapper>
                            <FlagItem title={user.origin.country.name} countryCode={user.origin.country.iocCode} />
                        </FlagItemWrapper>
                        <FlagItemWrapper>
                            <FlagItem
                                title={user.residency.country.name}
                                countryCode={user.residency.country.iocCode}
                            />
                        </FlagItemWrapper>
                    </FlagsWrapper>
                    {this.renderMetaInfo()}
                </UserDataWrapper>
            </TeaserWrapper>
        )
    }
}

export default userImagePlaceholder({
    genderProp: 'user.gender',
    imagePathProp: 'user.imagePath',
})(SuggestionTeaser)
