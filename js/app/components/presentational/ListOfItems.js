/* @flow */
import * as React from 'react'

export default function ListOfItems({ children, borderTop = false }: { borderTop?: boolean, children: React.Node }) {
    return (
        <ul className={`listOfItems listOfItems-noSpacing${borderTop ? ' listOfItems-withBorderTop' : ''}`}>
            {React.Children.map(children, child => (
                <li className="listOfItems__item">{child}</li>
            ))}
        </ul>
    )
}
