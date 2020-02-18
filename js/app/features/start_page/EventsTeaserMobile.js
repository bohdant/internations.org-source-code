// @flow
import React from 'react'
import styled from 'styled-components'
import Router from 'service/router'

import { formatWeekdayParseZone, formatDateTimeParseZone } from 'service/date/format'
import { GUTTER, HALF_GUTTER, GUTTER_PLUS_HALF } from 'app/styles/sizes'

import BlockLink from 'app/components/presentational/BlockLink'
import ActivityTeaser from 'app/features/start_page/ActivityTeaser'
import type { EventActivity } from 'app/types'

const ScrollableWrapper = styled.div`
    overflow-x: auto;
    scroll-snap-type: x mandatory;

    white-space: nowrap;
    padding: ${GUTTER} ${GUTTER_PLUS_HALF};
    margin: 0 -${HALF_GUTTER};

    scroll-padding: ${GUTTER_PLUS_HALF};

    ::-webkit-scrollbar {
        width: 0;
        background: transparent;
    }
`

const ElementWrapper = styled.div`
    display: inline-block;
    width: 100%;
    margin-left: ${GUTTER};
    white-space: initial;
    scroll-snap-align: start;

    :first-child {
        margin-left: 0;
    }
`

type Props = {
    events: Array<EventActivity>,
}

const EventsTeaserMobile = ({ events }: Props) => {
    const isSingle = events.length === 1
    const calendarUrl = Router.path('calendar_calendar_index', null, { query: { ref: 'sp_et_tl' } })
    return (
        <div>
            <ScrollableWrapper>
                {events.map((event: EventActivity, index: number) => {
                    const eventStartDate = `${formatWeekdayParseZone(event.startsOn)}, ${formatDateTimeParseZone(
                        event.startsOn
                    )}`
                    const ref = `sp_et_ti${index + 1}`
                    const link = Router.generateUrl(event.externalUrl, { query: { ref } })
                    const activityType = event.isNewcomerOnly ? 'newcomer' : event.type

                    return (
                        <ElementWrapper key={event.id} isSingle={isSingle}>
                            <ActivityTeaser
                                stickerTitle={event.stickerTitle}
                                activityType={activityType}
                                title={event.title}
                                link={link}
                                image={event.imageUrl}
                                attendees={event.attendeeCount}
                                date={eventStartDate}
                            />
                        </ElementWrapper>
                    )
                })}
            </ScrollableWrapper>
            <BlockLink href={calendarUrl} icon="calendar">
                Go to Events
            </BlockLink>
        </div>
    )
}

export default EventsTeaserMobile
