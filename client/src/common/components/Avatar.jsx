import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import UserIconPlaceholder from 'assets/images/user.svg';

class Avatar extends PureComponent {
  state = {
    isAvatarError: false
  };

  handleAvatarError = () => this.setState({ isAvatarError: true });

  render() {
    const { isAvatarError } = this.state;
    const { avatarUrl, className, name } = this.props;

    return (
      <img
        alt={`${name || 'user'} avatar`}
        className={classNames(`${className} avatar`, {
          avatar__placeholder: isAvatarError
        })}
        onError={this.handleAvatarError}
        src={isAvatarError ? UserIconPlaceholder : avatarUrl}
        title={name}
      />
    );
  }
}

Avatar.propTypes = {
  avatarUrl: PropTypes.string,
  className: PropTypes.string,
  name: PropTypes.string
};

export default Avatar;
