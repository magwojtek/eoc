import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _map from 'lodash/map';
import PropTypes from 'prop-types';
import { Manager, Reference } from 'react-popper';
import { withRouter } from 'react-router-dom';
import _debounce from 'lodash/debounce';

import { DotsIcon, PlusIcon } from 'assets/images/icons';
import MembersForm from './components/MembersForm';
import MemberBox from './components/MemberBox';
import MemberDetails from './components/MemberDetails';
import MemberButton from './components/MemberButton';
import { addCohortMember } from 'modules/cohort/model/actions';
import { addListMember } from 'modules/list/model/actions';
import { Routes } from 'common/constants/enums';

class MembersBox extends PureComponent {
  state = {
    context: null,
    isFormVisible: false,
    isMobile: window.outerWidth < 400
  };

  componentDidMount() {
    window.addEventListener('resize', _debounce(this.handleResize, 100));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    if (window.outerWidth < 400) {
      this.setState({ isMobile: true });
      return;
    }

    this.setState({ isMobile: false });
  };

  showForm = () => this.setState({ isFormVisible: true });

  hideForm = () => this.setState({ isFormVisible: false });

  handleDisplayingMemberDetails = id => () => {
    this.setState({ context: id });
  };

  handleClosingMemberDetails = () => {
    this.setState({ context: null });
  };

  handleAddNewMember = () => email => {
    this.hideForm();
    const { addCohortMember, addListMember } = this.props;
    const {
      match: {
        params: { id }
      },
      route
    } = this.props;

    switch (route) {
      case Routes.COHORT:
        addCohortMember(id, email);
        break;
      case Routes.LIST:
        addListMember(id, email);
        break;
      default:
        break;
    }
  };

  renderDetails = member => {
    const { isCurrentUserAnOwner, isPrivate, route } = this.props;

    return (
      <MemberDetails
        {...member}
        isCurrentUserAnOwner={isCurrentUserAnOwner}
        isPrivate={isPrivate}
        onClose={this.handleClosingMemberDetails}
        route={route}
      />
    );
  };

  renderMemberList = () => {
    const { members } = this.props;
    const { isMobile, context } = this.state;

    return _map(members, member => (
      <li
        className="members-box__list-item"
        key={member.avatarUrl}
        title={member.displayName}
      >
        {isMobile ? (
          <MemberButton
            member={member}
            onDisplayDetails={this.handleDisplayingMemberDetails(member._id)}
          />
        ) : (
          <Manager>
            <Reference>
              {({ ref }) => (
                <MemberButton
                  member={member}
                  onDisplayDetails={this.handleDisplayingMemberDetails(
                    member._id
                  )}
                  popperRef={ref}
                />
              )}
            </Reference>
            {context === member._id && (
              <MemberBox>{this.renderDetails(member)}</MemberBox>
            )}
          </Manager>
        )}
      </li>
    ));
  };

  render() {
    const { isFormVisible, context, isMobile } = this.state;
    const { members } = this.props;
    const currentUser = members[context];

    return (
      <div className="members-box">
        <header className="members-box__header">
          <h2 className="members-box__heading">Members</h2>
        </header>
        <ul className="members-box__list">
          <li className="members-box__list-item">
            {isFormVisible ? (
              <MembersForm onAddNew={this.handleAddNewMember()} />
            ) : (
              <button
                className="members-box__member"
                onClick={this.showForm}
                type="button"
              >
                <PlusIcon />
              </button>
            )}
          </li>
          {this.renderMemberList()}
          <li className="members-box__list-item">
            <button className="members-box__member" type="button">
              <DotsIcon />
            </button>
          </li>
        </ul>
        {isMobile && currentUser && this.renderDetails(currentUser)}
      </div>
    );
  }
}

MembersBox.propTypes = {
  isCurrentUserAnOwner: PropTypes.bool.isRequired,
  isPrivate: PropTypes.bool,
  members: PropTypes.objectOf(PropTypes.object).isRequired,
  route: PropTypes.string.isRequired,

  addCohortMember: PropTypes.func.isRequired,
  addListMember: PropTypes.func.isRequired
};

export default withRouter(
  connect(
    null,
    { addCohortMember, addListMember }
  )(MembersBox)
);
