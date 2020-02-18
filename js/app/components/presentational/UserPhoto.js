/* @flow */
import * as React from 'react'
import styled from 'styled-components'
import fastdom from 'fastdom'

import Picture, { type PropTypes as PicturePropTypes, Source } from 'app/components/presentational/Picture'
import RoleIcon from 'app/components/presentational/RoleIcon'
import FontIcon, { PX_SIZE_MAP, type IconSize } from 'app/components/presentational/FontIcon'

import assets from 'service/assets'
import media from 'app/styles/media'
import { type User, type GATrackingCustomVars } from 'app/types'

const resolveProfileImage = templatedUrl => retinaLevel =>
    assets.getImageUrl(templatedUrl, { format: `375_375${retinaLevel > 1 ? `-${retinaLevel}x` : ''}` })

const PictureContainer = styled.div`
    position: relative;
`

type IconPosition = 'bottom-center' | 'top-right'

const ICON_POSITION_MAP: { [string]: IconPosition } = {
    bottomCenter: 'bottom-center',
    topRight: 'top-right',
}

const RoleIconWrapper = styled.div`
    position: absolute;
    top: ${props => (props.isCircle ? '0px' : '8px')};
    right: ${props => (props.isCircle ? '0px' : '8px')};

    ${props => {
        if (props.iconPosition === ICON_POSITION_MAP.bottomCenter) {
            return media.tablet`
                        bottom: 16px;
                        top: auto;
                        right: auto;
                        left: calc(50% - ${PX_SIZE_MAP[props.iconSize] / 2}px);
                    `
        }

        return ''
    }};
`

const MagnifierIconWrapper = styled.div`
    position: absolute;

    ${props =>
        props.isCircle
            ? `
                bottom: 3px;
                right: 3px;
            `
            : `
                bottom: 13.35px;
                right: 13.35px;
            `};
`

type PhotoPropTypes = PicturePropTypes & { isCircle?: boolean, isPlaceholder?: boolean }

type PhotoState = {
    width: any,
    imageState: string,
}

class Photo extends React.PureComponent<PhotoPropTypes, PhotoState> {
    // eslint-disable-next-line react/sort-comp
    hostNode: ?Object

    state = {
        width: null,
        imageState: 'loading',
    }

    componentDidMount = this.updateMeasures

    componentWillReceiveProps() {
        this.resetInitialState()
    }

    componentDidUpdate = this.updateMeasures

    updateMeasures = () => {
        fastdom.measure(() => {
            if (!this.hostNode) {
                return
            }

            const { width } = this.hostNode.getBoundingClientRect()

            this.setState({ width })
        })
    }

    resetInitialState = () => {
        this.setState({
            width: null,
            imageState: 'loading',
        })
    }

    onHostNodeRef = ref => {
        if (!ref) {
            return
        }

        this.hostNode = ref
        this.updateMeasures()
    }

    onImageLoad = () => {
        this.setState({ imageState: 'loaded' })
    }

    render() {
        const { width, imageState } = this.state
        const { isCircle, isPlaceholder, className = '', ...propsToPass } = this.props

        const classNames = className.split(' ')
        const hostStyle = imageState !== 'loaded' && width ? { minHeight: width } : {}

        if (isCircle) {
            // TODO: make a utility class for this border-radius style?
            classNames.push('gradientAvatar__image')
        }

        if (isPlaceholder) {
            classNames.push('userPhotoPlaceholder')
        }

        return (
            <div ref={this.onHostNodeRef} style={hostStyle}>
                <Picture className={classNames.join(' ')} {...propsToPass} onLoad={this.onImageLoad} />
            </div>
        )
    }
}

type PropTypes = {
    user: User,
    iconPosition?: 'bottom-center' | 'top-right',
    iconSize?: IconSize,
    isMobile?: boolean,
    tooltipLinkRef?: string,
    ignoreRoleIconClick?: boolean,
    suppressMagnifier?: boolean,
    isCircle?: boolean,
    tooltipTrackingCustomVariables?: GATrackingCustomVars,
    noTooltip?: boolean,
}

const UserPhoto = ({
    user,
    iconPosition = 'bottom-center',
    iconSize,
    isMobile,
    tooltipLinkRef,
    ignoreRoleIconClick,
    suppressMagnifier = false,
    isCircle,
    tooltipTrackingCustomVariables,
    noTooltip,
}: PropTypes) => {
    // Set a default icon size based on the screen size
    if (!iconSize) {
        iconSize = isMobile ? 'large' : 'larger'
    }

    const userImagePath = user.imagePath || assets.getStaticImageUrl(`/placeholder/profile/${user.gender}-250x250.png`)

    return (
        <PictureContainer>
            <Photo
                title={user.name}
                alt={user.name}
                fallbackImage={resolveProfileImage(userImagePath)(3)}
                scale
                isCircle={isCircle}
                isPlaceholder={userImagePath.includes('frontend/images/placeholder/')}
            >
                <Source pathFunction={resolveProfileImage(userImagePath)} />
            </Photo>
            <RoleIconWrapper position={iconPosition} iconSize={iconSize} isCircle={isCircle}>
                <RoleIcon
                    user={user}
                    size={iconSize}
                    tooltipLinkRef={tooltipLinkRef}
                    ignoreClick={ignoreRoleIconClick}
                    tooltipTrackingCustomVariables={tooltipTrackingCustomVariables}
                    noTooltip={noTooltip}
                />
            </RoleIconWrapper>
            {suppressMagnifier ? null : (
                <MagnifierIconWrapper isCircle={isCircle}>
                    <FontIcon name="zoom_in" color={isCircle ? '' : 'white'} />
                </MagnifierIconWrapper>
            )}
        </PictureContainer>
    )
}

export default UserPhoto
