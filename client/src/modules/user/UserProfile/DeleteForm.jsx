import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './DeleteForm.scss';
import { IntlPropType } from 'common/constants/propTypes';

const DeleteForm = ({
  error,
  intl: { formatMessage },
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onVerificationTextChange
}) => (
  <form
    className={classNames('delete-form', { 'delete-form--error': error })}
    onSubmit={onSubmit}
  >
    <label className="delete-form__label">
      <FormattedMessage id="delete-form.email" />
      <input
        autoComplete="off"
        className="delete-form__input primary-input"
        onChange={onEmailChange}
        type="email"
      />
    </label>
    <label className="delete-form__label">
      <FormattedMessage
        id="delete-form.verify-message"
        values={{
          text: <em>{formatMessage({ id: 'delete-form.verify-text' })}</em>
        }}
      />
      <input
        autoComplete="off"
        className="delete-form__input primary-input"
        onChange={onVerificationTextChange}
        type="text"
      />
    </label>
    <label className="delete-form__label">
      <FormattedMessage id="user.auth.input.password.confirm" />
      <input
        autoComplete="off"
        className="delete-form__input primary-input"
        onChange={onPasswordChange}
        type="password"
      />
    </label>
    <input className="hidden" type="submit" />
  </form>
);

DeleteForm.propTypes = {
  error: PropTypes.bool,

  intl: IntlPropType.isRequired,
  onEmailChange: PropTypes.func.isRequired,
  onPasswordChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onVerificationTextChange: PropTypes.func.isRequired
};

export default injectIntl(DeleteForm);
