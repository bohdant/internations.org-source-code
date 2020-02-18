// @flow
import React from 'react'
import assets from 'service/assets'
import TeaserCardMobile from 'app/features/start_page/TeaserCardMobile'
import MetaInfo from 'app/components/presentational/MetaInformation'

type GroupTeaserMobileProps = {
    stickerTitle: string,
    title: string,
    memberCount: number,
    metaCountry: number,
    link: string,
    image?: string,
    testClass?: string,
}

const GroupTeaserMobile = ({
    stickerTitle,
    title,
    memberCount,
    metaCountry,
    link,
    image,
    testClass = '',
}: GroupTeaserMobileProps) => {
    const formatedImage = image && assets.getImageUrl(image, { format: '1280_300' })
    return (
        <TeaserCardMobile
            stickerColor="green"
            stickerTitle={stickerTitle}
            title={title}
            link={link}
            image={formatedImage}
            testClass={testClass}
        >
            <div className="u-halfSpaceBottom">
                <MetaInfo icon="group">{`${memberCount} Group Member${memberCount !== 1 ? 's' : ''}`}</MetaInfo>
            </div>
            <MetaInfo icon="nationality">
                {`From ${metaCountry} ${metaCountry === 1 ? 'Country' : 'Countries'}`}
            </MetaInfo>
        </TeaserCardMobile>
    )
}

export default GroupTeaserMobile
