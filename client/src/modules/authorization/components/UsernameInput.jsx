import React, { PureComponent } from 'react';
import validator from 'validator';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';
import _debounce from 'lodash/debounce';
import _trim from 'lodash/trim';

import { IntlPropType } from 'common/constants/propTypes';
import { CheckIcon, ErrorIcon } from 'assets/images/icons';

class UsernameInput extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      errorMessageId: '',
      wasEdited: false
    };

    this.nameInput = React.createRef();
    this.debouncedNameChange = _debounce(this.handleNameChange, 500);
  }

  componentDidMount() {
    this.nameInput.current.focus();
  }

  componentWillUnmount() {
    this.debouncedNameChange.cancel();
  }

  handleNameChange = () => {
    const { value, wasEdited } = this.state;
    const { onChange } = this.props;
    const { isEmpty, isLength } = validator;
    const trimmedValue = _trim(value);
    let errorMessageId = '';

    if (isEmpty(trimmedValue)) {
      errorMessageId = 'authorization.input.username.empty';
    } else if (!isLength(trimmedValue, { min: 1, max: 32 })) {
      errorMessageId = 'authorization.input.username.invalid';
    }

    const newState = { errorMessageId };

    if (!wasEdited) {
      newState.wasEdited = true;
    }

    this.setState(newState);
    onChange(trimmedValue, !errorMessageId);
  };

  handleInputChange = event => {
    const { value } = event.target;

    this.setState({ value }, this.debouncedNameChange);
  };

  renderFeedback = () => {
    const { errorMessageId } = this.state;
    const {
      externalErrorId,
      intl: { formatMessage }
    } = this.props;
    const isValid = !externalErrorId && !errorMessageId;

    const feedbackMessageId = isValid
      ? 'authorization.input.username.valid'
      : externalErrorId || errorMessageId;

    return (
      <p className="Sign-Up-Input__feedback">
        <span
          className={classNames('Sign-Up-Input__feedback-icon', {
            'Sign-Up-Input__feedback-icon--valid': isValid,
            'Sign-Up-Input__feedback-icon--invalid': !isValid
          })}
        >
          {isValid ? <CheckIcon /> : <ErrorIcon />}
        </span>
        <span
          className={classNames('Sign-Up-Input__feedback-info', {
            'Sign-Up-Input__feedback-info--valid': isValid,
            'Sign-Up-Input__feedback-info--invalid': !isValid
          })}
        >
          {formatMessage({ id: feedbackMessageId })}
        </span>
      </p>
    );
  };

  render() {
    const {
      disabled,
      externalErrorId,
      intl: { formatMessage }
    } = this.props;
    const { errorMessageId, value, wasEdited } = this.state;
    const isValid = !externalErrorId && !errorMessageId;

    return (
      <div className="Sign-Up-Input__input-box">
        <label
          className={classNames('Sign-Up-Input__label', {
            'Sign-Up-Input__label--valid': wasEdited && isValid,
            'Sign-Up-Input__label--invalid': wasEdited && !isValid
          })}
          htmlFor="username"
        >
          {formatMessage({
            id: 'authorization.input.username.label'
          })}
        </label>
        <input
          id="username"
          className={classNames('primary-input Sign-Up-Input__input', {
            'Sign-Up-Input__input--valid': wasEdited && isValid,
            'Sign-Up-Input__input--invalid': wasEdited && !isValid
          })}
          disabled={disabled}
          name="name"
          onChange={this.handleInputChange}
          ref={this.nameInput}
          type="text"
          value={value}
        />
        {(externalErrorId || wasEdited) && this.renderFeedback()}
      </div>
    );
  }
}

UsernameInput.propTypes = {
  disabled: PropTypes.bool,
  externalErrorId: PropTypes.string,
  intl: IntlPropType.isRequired,
  onChange: PropTypes.func.isRequired
};

export default injectIntl(UsernameInput);
