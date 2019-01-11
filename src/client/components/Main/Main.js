import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import AuthBox from '../AuthBox';
import App from '../App';
import { setCurrentUser } from './actions';
import { UserPropType } from '../../common/propTypes';

class Main extends Component {
  componentDidMount() {
    this.setAuthenticationState();
  }

  setAuthenticationState = () => {
    const { setCurrentUser } = this.props;

    setCurrentUser();
  };

  render() {
    const { currentUser } = this.props;

    return currentUser ? <App /> : <AuthBox />;
  }
}

Main.propTypes = {
  currentUser: UserPropType,

  setCurrentUser: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  currentUser: state.currentUser
});

export default connect(
  mapStateToProps,
  { setCurrentUser }
)(Main);
