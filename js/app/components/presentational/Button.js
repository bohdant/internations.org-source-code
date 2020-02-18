/* @flow */
import * as React from 'react'

const TYPES = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    danger: 'btn btn-danger',
    text: 'btn btn-text',
}

export type ButtonType = $Keys<typeof TYPES>

export type PropTypes = {
    className?: ?string,
    children: React.Node,
    kind?: ButtonType,
    type?: string,
    href?: string,
    onClick?: Function,
    isBlock?: boolean,
    isFixedHeight?: boolean,
    disabled?: boolean,
    large?: boolean,
}

/**
 * @example
 *
 * import Button from 'app/component/presentational/Button';
 * <Button kind="secondary">
 *     Click me!
 * </Button>
 */
const Button = ({
    children,
    kind,
    href,
    onClick,
    isBlock,
    isFixedHeight,
    large,
    disabled,
    className,
    ...rest
}: PropTypes) => {
    const classNames = kind ? [TYPES[kind]] : []

    if (isBlock) {
        classNames.push('btn-block')
    }

    if (large) {
        classNames.push('btn-large')
    }

    if (isFixedHeight) {
        classNames.push('btn-fixedHeight')
    }

    if (className) {
        classNames.push(className)
    }

    const props = {
        className: classNames.join(' '),
        href,
        onClick,
        disabled,
    }

    if (href) {
        return <a {...props}>{children}</a>
    }

    return (
        <button {...props} {...rest}>
            {children}
        </button>
    )
}

Button.defaultProps = {
    kind: 'primary',
    type: 'button',
    href: '',
    onClick: () => null,
    disabled: false,
}

export default Button

// seems like flow does not check implicit boolean true values
// eslint-disable-next-line react/jsx-boolean-value
export const BlockButton = (props: PropTypes) => <Button {...props} isBlock={true} />
