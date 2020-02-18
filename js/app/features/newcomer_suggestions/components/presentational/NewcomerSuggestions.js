// @flow
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import styled from 'styled-components'
import _ from 'lodash'

import { fetchNewcomersSuggestions, sendContactRequest } from 'app/features/newcomer_suggestions/api'
import AnimateOut from 'app/features/newcomer_suggestions/components/presentational/AnimateOut'
import SuggestionCard from 'app/features/newcomer_suggestions/components/presentational/SuggestionCard'
import SuggestionTeaser from 'app/features/newcomer_suggestions/components/presentational/SuggestionTeaser'
import Button from 'app/components/presentational/Button'
import Loading from 'app/components/presentational/Loading'
import WhiteBox from 'app/components/presentational/WhiteBox'
import Breakpoint from 'app/components/enhancer/Breakpoint'

import media from 'app/styles/media'
import { GUTTER_PLUS_HALF, HALF_GUTTER, GUTTER } from 'app/styles/sizes'
import { COLOR_DARK_BLUE } from 'app/styles/colors'
import { FONT_SIZE_XLARGE, FONT_FAMILY_BRAND, FONT_SIZE_BASE } from 'app/styles/typography'

import dataProvider from 'service/data_provider'
import type { User } from 'app/types'
import configureStore from 'app/redux/configureStore'
import getInitialStoreState from 'app/redux/utils/getInitialStoreState'
import createHistory from 'history/createBrowserHistory'
import { trackEvent } from 'app/api/index'
import stickyFlashMessage from 'shared/view/sticky_flash_message'

const history = createHistory()
const store = configureStore(getInitialStoreState(), { history })

const REQUEST_SUCCESS_MESSAGE = 'Contact requests sent. <a href="/contact/request/">Write them a message</a> to say hi!'

const Wrapper = styled.div`
    padding: ${GUTTER_PLUS_HALF} ${HALF_GUTTER} ${GUTTER};
`

const SuggestionsWrapper = styled.div`
    overflow-x: auto;
    -webkit-overflow-scrolling: touch; /* momentum scrolling on iOS */
    margin-top: ${GUTTER};

    ${media.tablet`
        display: flex;
        justify-content: center;
        margin-top: 0;
   `};
`

const ButtonsWrapper = styled.div`
    margin-top: ${HALF_GUTTER};
    display: flex;
    flex-direction: column;

    ${media.tablet`
        flex-direction: row-reverse;
        justify-content: flex-start;
    `};
`

const SubHeader = styled.p`
    color: ${COLOR_DARK_BLUE};
    font-family: ${FONT_FAMILY_BRAND};
    font-size: ${FONT_SIZE_BASE};
    letter-spacing: -0.27px;
    line-height: 18px;
    max-width: 600px;
    margin: auto;

    ${media.tablet`
        font-size: ${FONT_SIZE_XLARGE};
        line-height: 24px;
    `};
`

type State = {
    close: boolean,
    submitting: boolean,
    suggestions: { [key: string]: User },
    selected: Array<any>,
}

class NewcomerSuggestions extends Component<null, State> {
    state = {
        close: false,
        submitting: false,
        suggestions: {},
        selected: [],
    }

    componentDidMount() {
        fetchNewcomersSuggestions()
            .then(data => {
                const suggestions = data.entities.user
                const selected = data.result.list
                this.setState({ suggestions, selected })
                trackEvent({ eventType: 'ONBOARDING_CONTACT_NEW_USERS_VIEW' })
            })
            .fail(() => {
                this.setState({ close: true })
            })
    }

    onSkip = () => {
        trackEvent({ eventType: 'ONBOARDING_CONTACT_NEW_USERS_MAYBE_LATER' })
        this.setCookie()
        this.setState({ close: true })
    }

    onSubmit = () => {
        /**
         * We will consider it a success even if just 1 of the requests
         * is send, so we will wait for all of them (the requests) to be done and count
         * how many of them actually succeed. Additionally we need to count how many of
         * the requests have been proccessed to know if we are actually processing the
         * lastone.
         */

        const selectedIds = [...this.state.selected]
        let requestsSucceedCount = 0
        let requestsProcessedCount = 0
        this.setState({ submitting: true })

        selectedIds.forEach(userId =>
            sendContactRequest({ userId })
                .then(() => {
                    trackEvent({
                        eventType: 'ONBOARDING_CONTACT_NEW_USERS_SENT',
                        params: { recipientUserId: userId },
                    })
                    requestsSucceedCount++
                })
                .always(() => {
                    requestsProcessedCount++
                    // This means that all the promises has been resolved
                    if (requestsProcessedCount === selectedIds.length) {
                        this.postSubmit(requestsSucceedCount > 0)
                    }
                })
        )
    }

    onToggleSuggestion = (userId: number) => {
        if (this.state.selected.includes(userId)) {
            const selected = _.filter(this.state.selected, x => x !== userId)
            this.setState({ selected })
        } else {
            const selected = _.union(this.state.selected, [userId])
            this.setState({ selected })
        }
    }

    setCookie = () => {
        const maxAge = 86400 // 1 days
        document.cookie = `ncsm=true; max-age=${maxAge}`
    }

    postSubmit = (succeed: boolean) => {
        if (succeed) {
            this.setCookie()
            this.setState({ close: true })
            stickyFlashMessage.show(REQUEST_SUCCESS_MESSAGE, { append: true })
        } else {
            this.setState({ submitting: false })
            const requestAmount = this.state.selected.length
            stickyFlashMessage.show(
                `Contact request${requestAmount > 1 ? 's' : ''} could not be sent. Please reload the page`,
                { append: true, type: 'error' }
            )
        }
    }

    userName = `${dataProvider.get('currentUser').firstName} ${dataProvider.get('currentUser').lastName}`

    renderSuggestions = (prop: { breakpoint: string }) => {
        const { suggestions, selected } = this.state
        const isMobile = prop.breakpoint === 'mobile'
        let suggestionCount = 0

        return _.map(suggestions, user => {
            suggestionCount++
            const className = `t-newcomer-suggestions-checkbox-${suggestionCount}`
            return isMobile ? (
                <SuggestionTeaser
                    key={user.id}
                    user={user}
                    toggleSuggestion={this.onToggleSuggestion}
                    isChecked={_.includes(selected, user.id)}
                    className={className}
                />
            ) : (
                <SuggestionCard
                    key={user.id}
                    user={{ ...user, name: user.firstName }}
                    toggleSuggestion={this.onToggleSuggestion}
                    isChecked={_.includes(selected, user.id)}
                    className={className}
                />
            )
        })
    }

    render() {
        const isLoading = _.isEmpty(this.state.suggestions)

        if (isLoading) {
            return <Loading />
        }

        return (
            <AnimateOut out={this.state.close} className="u-doubleSpaceBottom">
                <WhiteBox noSpacing>
                    <Wrapper>
                        <h1 className="u-textCenter">Welcome new members!</h1>
                        <SubHeader className="u-textCenter">
                            Reach out to these new members of the {dataProvider.get('currentUser').localcommunityName}{' '}
                            Community and say hi!
                        </SubHeader>
                        <SuggestionsWrapper>
                            <Breakpoint>{this.renderSuggestions}</Breakpoint>
                        </SuggestionsWrapper>
                        <ButtonsWrapper>
                            <Button
                                className="t-newcomer-suggestions-submit"
                                disabled={!(this.state.selected.length > 0) || this.state.submitting}
                                onClick={this.onSubmit}
                            >
                                Connect
                            </Button>
                            <Button
                                className="t-newcomer-suggestions-later btn-text u-halfSpaceTopBelowTablet u-spaceRight"
                                onClick={this.onSkip}
                            >
                                Maybe later
                            </Button>
                        </ButtonsWrapper>
                    </Wrapper>
                </WhiteBox>
            </AnimateOut>
        )
    }
}

export const withProvider = (Child: any) => (props: Object) => (
    <Provider store={store}>
        <Child {...props} />
    </Provider>
)

export default NewcomerSuggestions
