import React, { PureComponent } from 'react';
import validator from 'validator';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { resetPassword } from '../model/actions';

class ResetPassword extends PureComponent {
  state = {
    email: '',
    tipVisible: false
  };

  handleInputChange = event => {
    const {
      target: { value }
    } = event;

    this.setState({ email: value });
  };

  handleSubmit = event => {
    event.preventDefault();
    const { email } = this.state;
    const isEmailCorrect = validator.isEmail(email);
    const { resetPassword } = this.props;

    if (!isEmailCorrect) {
      this.showTip();

      return;
    }

    resetPassword(email);
    this.hideTip();
  };

  showTip = () => this.setState({ tipVisible: true });

  hideTip = () => this.setState({ tipVisible: false });

  render() {
    const { email, tipVisible } = this.state;
    const isEmailEmpty = email.length === 0;

    return (
      <form className="reset-password" onSubmit={this.handleSubmit}>
        <h2 className="reset-password__heading">
          <FormattedMessage id="authorization.reset-password.heading" />
        </h2>
        <div className="reset-password__body">
          <label className="reset-password__email-label">
            <FormattedMessage id="authorization.reset-password.email-label" />
            <input
              className="reset-password__email-input primary-input"
              onChange={this.handleInputChange}
              type="email"
              value={email}
            />
          </label>
          {tipVisible && (
            <span className="reset-password__message-error">
              <FormattedMessage id="authorization.input.email.invalid" />
            </span>
          )}
          <button
            className="primary-button"
            disabled={isEmailEmpty}
            onClick={this.handleSubmit}
            type="submit"
            value="Reset password"
          >
            <FormattedMessage id="authorization.reset-password.button-content" />
          </button>
        </div>
      </form>
    );
  }
}

ResetPassword.propTypes = {
  resetPassword: PropTypes.func
};

export default connect(
  null,
  { resetPassword }
)(ResetPassword);
