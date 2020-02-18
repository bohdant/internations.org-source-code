/* @flow */
import * as React from 'react'

const FlagItem = ({
    countryCode,
    title = '',
    size = 16,
}: {
    countryCode: string,
    size?: 16 | 24 | 32 | 48,
    title?: string,
}) => <i className={`flag-${size} flag-${countryCode} icon-block`} title={title} />

export default FlagItem
