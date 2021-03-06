import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './TextInput.scss';

class TextInput extends PureComponent {
  constructor(props) {
    super(props);

    const { initialValue } = this.props;
    this.state = {
      isEnlarged: initialValue.length > 0,
      value: initialValue
    };

    this.input = React.createRef();
  }

  handleOnChange = event => {
    const {
      target: { value }
    } = event;
    const { onChange } = this.props;

    this.setState({ value });
    if (onChange) {
      onChange(value);
    }
  };

  focusInput = () => this.input.current.focus();

  handleFocus = () => this.setState({ isEnlarged: true });

  handleBlur = () => {
    const { value } = this.state;

    if (value.length === 0) {
      this.setState({ isEnlarged: false });
    }
  };

  render() {
    const { disabled, placeholder } = this.props;
    const { isEnlarged, value } = this.state;

    return (
      <div className="ss-text-input">
        {placeholder && (
          <button
            className={classNames('ss-text-input__placeholder', {
              'ss-text-input__placeholder--is-focused': isEnlarged
            })}
            disabled={isEnlarged}
            onClick={this.focusInput}
            type="button"
          >
            {placeholder}
          </button>
        )}
        <input
          className="ss-text-input__input"
          disabled={disabled}
          name={placeholder}
          onBlur={this.handleBlur}
          onChange={this.handleOnChange}
          onFocus={this.handleFocus}
          placeholder={placeholder}
          ref={this.input}
          type="text"
          value={value}
        />
      </div>
    );
  }
}

TextInput.propTypes = {
  disabled: PropTypes.bool,
  initialValue: PropTypes.string,
  placeholder: PropTypes.string.isRequired,

  onChange: PropTypes.func
};

export default TextInput;
