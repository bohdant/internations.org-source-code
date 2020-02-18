// @flow
import * as React from 'react'
import styled from 'styled-components'
import { COLOR_BLUE, COLOR_GREY60 } from 'app/styles/colors'
import { HALF_GUTTER } from 'app/styles/sizes'
import { BORDER_RADIUS } from 'app/styles/general'
import type { FieldProps } from 'redux-form'

const checkboxSize = '24px'
const lineThickness = '2px'

const HiddenCheckbox = styled.input`
    width: 0;
    height: 0;
    opacity: 0;
    display: block;
`

const StyledCheckbox = styled.div`
    position: relative;
    width: ${checkboxSize};
    height: ${checkboxSize};
    border: ${lineThickness} solid;
    border-color: ${props => (props.disabled ? COLOR_GREY60 : COLOR_BLUE)};
    background: ${props => (props.checked ? COLOR_BLUE : 'transparent')};
    border-radius: ${BORDER_RADIUS};
    margin-right: ${props => (props.hasLabel ? HALF_GUTTER : '0')};
    flex-shrink: 0;
    cursor: pointer;

    &::after {
        content: '';
        display: ${props => (props.checked ? 'block' : 'none')};
        position: absolute;
        left: 7px;
        top: 2px;
        width: 6px;
        height: 12px;
        border: solid white;
        border-width: 0 ${lineThickness} ${lineThickness} 0;
        transform: rotate(45deg);
    }
`

type CheckboxProps = {
    name: string,
    value: any,
    isChecked: boolean,
    onChange: Function,
    isValid?: boolean,
    onBlur?: Function,
    onFocus?: Function,
    label?: React.Node,
    isDisabled?: boolean,
    errorMessage?: React.Node,
    className?: string,
}

type CheckboxState = {
    isFocused: boolean,
}

class Checkbox extends React.Component<CheckboxProps, CheckboxState> {
    static defaultProps = {
        className: '',
        isValid: true,
    }

    state = { isFocused: false }

    onFocus = (ev: SyntheticEvent<>) => {
        this.setState({ isFocused: true })
        if (this.props.onFocus) {
            this.props.onFocus(ev)
        }
    }

    onBlur = (ev: SyntheticEvent<>) => {
        this.setState({ isFocused: false })
        if (this.props.onBlur) {
            this.props.onBlur(ev)
        }
    }

    render() {
        const { name, value, label, errorMessage, isChecked, isValid, isDisabled, onChange, className } = this.props
        return (
            <React.Fragment>
                <label className="u-flex" htmlFor={name}>
                    <StyledCheckbox
                        hasLabel={Boolean(label)}
                        className={className}
                        checked={isChecked}
                        disabled={isDisabled}
                        isFocused={this.state.isFocused}
                    >
                        <HiddenCheckbox
                            type="checkbox"
                            id={name}
                            name={name}
                            value={value}
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={onChange}
                            onFocus={this.onFocus}
                            onBlur={this.onBlur}
                        />
                    </StyledCheckbox>
                    {label}
                </label>
                {!isValid && (
                    <div className="formField">
                        <ul className="formField__errorList">
                            <li>{errorMessage}</li>
                        </ul>
                    </div>
                )}
            </React.Fragment>
        )
    }
}

export const ConnectedCheckbox = ({
    input,
    meta,
    label,
    className,
    isDisabled,
}: {
    label?: React.Node,
    isDisabled?: boolean,
    className?: string,
} & FieldProps) => {
    const { name, value, onBlur: reduxFormOnBlur, onFocus: reduxFormOnFocus, onChange: reduxFormOnChange } = input
    const { touched, error: errorMessage } = meta

    const isValid = !(touched && errorMessage)

    return (
        <Checkbox
            name={name}
            value={name}
            label={label}
            className={className}
            errorMessage={errorMessage}
            isChecked={value}
            isValid={isValid}
            isDisabled={isDisabled}
            onBlur={reduxFormOnBlur}
            onFocus={reduxFormOnFocus}
            onChange={reduxFormOnChange}
        />
    )
}

export default Checkbox
