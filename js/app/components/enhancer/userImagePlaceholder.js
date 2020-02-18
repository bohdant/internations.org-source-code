/* @flow */
import * as React from 'react'
import { get, set } from 'lodash'

import assets from 'service/assets'

const userImagePlaceholder = ({ imagePathProp, genderProp }: { imagePathProp: string, genderProp: string }) => (
    Child: React.ElementType
) => {
    const UserImagePlaceholder = (props: Object) => {
        if (get(props, imagePathProp)) {
            return <Child {...props} />
        }

        const genderPrefix = get(props, genderProp) === 'm' ? 'm' : 'f'
        const imagePath = assets.getStaticImageUrl(`/placeholder/profile/${genderPrefix}-250x250.png`)

        const propsCopy = set({ ...props }, imagePathProp, imagePath)

        return <Child {...propsCopy} />
    }

    return UserImagePlaceholder
}

export default userImagePlaceholder
