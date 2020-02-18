// @flow
import * as React from 'react'
import styled from 'styled-components'
import { BORDER_RADIUS, BOX_SHADOW_Z3 } from 'app/styles/general'
import { COLOR_WHITE, COLOR_GREY20 } from 'app/styles/colors'
import { GUTTER } from 'app/styles/sizes'
import assets from 'service/assets'
import cut from 'service/string/cut'

const TeaserWrapperDiv = styled.div`
    background: ${COLOR_WHITE};
    box-shadow: ${BOX_SHADOW_Z3};
    border-radius: ${BORDER_RADIUS};
    overflow: hidden; /* Needed so the background image in the body sticks to the border radius */
    cursor: pointer;
`

const TeaserWrapperLink = TeaserWrapperDiv.extend`
    display: block;
    text-decoration: none;
    &:hover {
        text-decoration: none;
    }
    color: ${COLOR_GREY20}; // set default text color when it's link.
`.withComponent('a')

const TeaserBody = styled.div`
    position: relative;
    width: 100%;
    padding: ${GUTTER};
    padding-top: 56.25%; /* 16:9 aspect ratio: https://www.w3schools.com/howto/howto_css_aspect_ratio.asp */

    background: url(${props => props.image});
    background-size: cover;
    background-position: center;

    &:before {
        /* This is the gradient on top of the image, using a pseudo element to avoid adding another element to the DOM */
        content: '';
        position: absolute;
        display: block;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0.8;
        background: linear-gradient(-180deg, transparent 0%, #000000 100%);
    }
`

const TeaserBodyContent = styled.div`
    /* Position absolute in order to maintain the aspect ratio of the body */
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    width: 100%;
    height: 100%;
    padding: ${GUTTER};
    flex-direction: column;
    justify-content: flex-end;
`

const Sticker = styled.div`
    align-self: flex-start;
    margin-bottom: ${GUTTER};
    padding-left: ${GUTTER};
    padding-right: ${GUTTER};
    line-height: 24px;
    border-radius: 12px;
    color: ${COLOR_WHITE};
    text-align: center;
`

const TeaserTitle = styled.div`
    font-size: 22px;
`
const TeaserFooter = styled.div`
    padding: ${GUTTER};
`

type TeaserProps = {
    title: string,
    image?: string,
    onClick?: Function,
    link?: string,
    children: React.Node,
    stickerTitle?: string,
    stickerColor?: string,
    testClass?: string,
}

const TeaserCardMobile = ({
    stickerTitle,
    title,
    image,
    onClick,
    link,
    children,
    testClass = '',
    stickerColor = 'yellow',
}: TeaserProps) => {
    const TeaserWrapper = link ? TeaserWrapperLink : TeaserWrapperDiv
    const href = link ? { href: link } : {}
    const teaserImage = image || assets.getStaticImageUrl('/ui/empty-states/no-photos-v1.svg')
    const shortenedTitle = cut(title, 39)

    return (
        // TODO INGROWTH-1303: refactor to support testing classes.
        <TeaserWrapper {...href} onClick={onClick} className={testClass}>
            <TeaserBody image={teaserImage}>
                <TeaserBodyContent>
                    {stickerTitle && <Sticker className={`sticker sticker-${stickerColor}`}>{stickerTitle}</Sticker>}
                    <TeaserTitle className="teaserTitle teaserTitle-white">{shortenedTitle}</TeaserTitle>
                </TeaserBodyContent>
            </TeaserBody>
            {children && <TeaserFooter>{children}</TeaserFooter>}
        </TeaserWrapper>
    )
}

export default TeaserCardMobile
