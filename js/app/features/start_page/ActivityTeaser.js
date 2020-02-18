// @flow
import React from 'react'
import assets from 'service/assets'
import TeaserCardMobile from 'app/features/start_page/TeaserCardMobile'
import MetaInfo from 'app/components/presentational/MetaInformation'

type ActivityTeaserProps = {
    activityType: 'activity' | 'event' | 'newcomer',
    stickerTitle: string,
    title: string,
    link: string,
    image?: string,
    date?: string,
    attendees: number,
}

const ActivityTeaser = ({ activityType, stickerTitle, title, link, image, date, attendees }: ActivityTeaserProps) => {
    const stickerColor = getStickerColor(activityType)
    const formatedImage = image && assets.getImageUrl(image, { format: '600_600' })

    return (
        <TeaserCardMobile
            stickerColor={stickerColor}
            stickerTitle={stickerTitle}
            title={title}
            link={link}
            image={formatedImage}
        >
            <div className="u-halfSpaceBottom">
                <MetaInfo icon="calendar">{date}</MetaInfo>
            </div>
            <MetaInfo icon="group">{`${attendees} ${attendees === 1 ? 'attendee' : 'attendees'}`}</MetaInfo>
        </TeaserCardMobile>
    )
}

const getStickerColor = type => {
    const color = {
        activity: 'blue',
        event: 'yellow',
        newcomer: 'red',
    }[type]

    return color || 'yellow'
}

export default ActivityTeaser
