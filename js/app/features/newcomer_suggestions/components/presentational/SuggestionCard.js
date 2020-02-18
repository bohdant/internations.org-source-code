// @flow
import React, { PureComponent } from 'react'
import UserPhoto from 'app/components/presentational/UserPhoto'
import userImagePlaceholder from 'app/components/enhancer/userImagePlaceholder'
import FlagItem from 'app/components/presentational/FlagItem'
import type { User } from 'app/types'
import styled from 'styled-components'
import media from 'app/styles/media'
import { trackEvent } from 'app/api/index'
import { GUTTER, HALF_GUTTER, QUARTER_GUTTER } from 'app/styles/sizes'
import { COLOR_ORANGE } from 'app/styles/colors'
import Checkbox from 'app/components/presentational/Checkbox'
import _ from 'lodash'

type SuggestionCardProps = {
    user: User,
    isChecked: boolean,
    toggleSuggestion: Function,
    className?: string,
}

const Wrapper = styled.div`
    white-space: initial;
    position: relative;
    margin: ${HALF_GUTTER};
    display: inline-block;
    width: 200px;
    height: 270px;
    ${media.tablet`
        margin: ${GUTTER};
   `};
`

const UserPhotoWrapper = styled.div`
    width: 72px;
    height: 72px;
    margin: 0 auto ${HALF_GUTTER};
`

const FlagItemWrapper = styled.div`
    padding: 0 ${QUARTER_GUTTER};
`

const FlagsWrapper = styled.div`
    display: flex;
    width: 100%;
    justify-content: center;
`

const Separator = styled.div`
    background: ${COLOR_ORANGE};
    height: 2px;
    width: 70%;
    margin: ${GUTTER} auto;
`

const Details = styled.div`
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
`

const CheckboxWrapper = styled.div`
    position: absolute;
    top: ${HALF_GUTTER};
    right: ${HALF_GUTTER};
`
class SuggestionCard extends PureComponent<SuggestionCardProps> {
    static defaultProps = {
        className: '',
    }

    componentDidMount() {
        trackEvent({
            eventType: 'ONBOARDING_CONTACT_NEW_USERS_PROFILE_DISPLAYED',
            params: { displayedUserId: this.props.user.id },
        })
    }

    onToggleSuggestion = () => {
        this.props.toggleSuggestion(this.props.user.id)
    }

    renderInterests = () => {
        const { user } = this.props

        return user.interests && user.interests.length > 3 ? (
            <div>Interested in: {_.truncate(user.interests.join(', '), { length: 65, separator: ',' })}</div>
        ) : (
            <div>
                Born in: {user.origin.city}
                <br />
                Living in: {user.residency.city}
            </div>
        )
    }

    render() {
        const { user, isChecked, className } = this.props
        return (
            <Wrapper className="t-newcomer-suggestions whiteBox">
                <CheckboxWrapper>
                    <Checkbox
                        name={`suggestion-${user.id}`}
                        value={`suggestion-${user.id}`}
                        className={className}
                        isChecked={isChecked}
                        onChange={this.onToggleSuggestion}
                    />
                </CheckboxWrapper>
                <UserPhotoWrapper>
                    <UserPhoto suppressMagnifier noTooltip isCircle user={user} iconSize="standard" />
                </UserPhotoWrapper>
                <a href={`/profile/${user.id}`} className="teaserTitle u-block u-textCenter u-textEllipsis">
                    {user.firstName} {user.lastName}
                </a>
                <Details>
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
                    <Separator />
                    {this.renderInterests()}
                </Details>
            </Wrapper>
        )
    }
}

export default userImagePlaceholder({
    genderProp: 'user.gender',
    imagePathProp: 'user.imagePath',
})(SuggestionCard)
