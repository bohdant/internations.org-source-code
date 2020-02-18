/* @flow */
import * as React from 'react'
import invariant from 'invariant'

type Children = React.Element<any> | Array<React.Element<any>>

export type PropTypes = { children: Children, condition: boolean }

const If = ({ condition, children }: PropTypes) => {
    if (Array.isArray(children)) {
        invariant(children.length === 2, 'Expected a children array of length 2, got %s', children.length)

        return condition ? children[0] : children[1]
    }

    return condition ? children : null
}

export default If
