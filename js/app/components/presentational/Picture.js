/* @flow */
import * as React from 'react'

import { type CssStyle } from 'app/types'

export type PropTypes = {
    alt?: string,
    children: React.Node,
    className?: string,
    fallbackImage: ?string,
    onAbort?: (event: Object) => void,
    onError?: (event: Object) => void,
    onLoad?: (event: Object) => void,
    onProgress?: (event: Object) => void,
    scale?: boolean,
    title?: string,
    imgStyle?: CssStyle,
}

// TODO(Francesco): document how to use this thing
export const Picture = ({
    alt,
    children,
    className = '',
    fallbackImage,
    onAbort,
    onError,
    onLoad,
    onProgress,
    scale = false,
    title,
    imgStyle,
}: PropTypes) => (
    <picture>
        {children}
        <img
            alt={alt}
            className={`responsiveImage${scale ? ' responsiveImage-scale' : ''} ${className}`}
            onAbort={onAbort}
            onError={onError}
            onLoad={onLoad}
            onProgress={onProgress}
            src={fallbackImage}
            title={title}
            style={imgStyle}
        />
    </picture>
)

const makeSourceDefinition = (pathFunction, retinaLevel) => {
    const path = pathFunction(retinaLevel)

    if (!path) {
        return null
    }

    return `${path} ${retinaLevel}x`
}

const makeSourceSet = pathFunction => {
    // there should be a 1x version always
    const basePath = makeSourceDefinition(pathFunction, 1)

    if (!basePath) {
        throw new Error('Missing base image for retina picture')
    }

    const retinaPaths = [2, 3]
        .map(retinaLevel => makeSourceDefinition(pathFunction, retinaLevel))
        .filter(path => Boolean(path))

    return [basePath, ...retinaPaths].join(', ')
}

export const Source = ({ minWidth, pathFunction }: { minWidth?: number, pathFunction: Function }) => (
    <source media={minWidth ? `(min-width: ${minWidth}px)` : null} srcSet={makeSourceSet(pathFunction)} />
)

export default Picture
