import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import { RouterMatchPropType, UserPropType } from 'common/constants/propTypes';
import { CloseIcon, InfoIcon } from 'assets/images/icons';
import { getCurrentUser } from 'modules/authorization/model/selectors';
import {
  addOwnerRole as addOwnerRoleInCohort,
  removeCohortMember,
  removeOwnerRole as removeOwnerRoleInCohort,
  leaveCohort
} from 'modules/cohort/model/actions';
import {
  addOwnerRole as addOwnerRoleInList,
  removeOwnerRole as removeOwnerRoleInList,
  addMemberRole as addMemberRoleInList,
  removeMemberRole as removeMemberRoleInList,
  removeListMember
} from 'modules/list/model/actions';
import { Routes, UserRoles, UserRolesToDisplay } from 'common/constants/enums';
import Preloader from 'common/components/Preloader';
import SwitchButton from 'common/components/SwitchButton';
import { ListType } from 'modules/list/consts';
import Avatar from 'common/components/Avatar';
import PendingButton from 'common/components/PendingButton';

const infoText = {
  [Routes.COHORT]: {
    [UserRoles.OWNER]: 'common.member-details.cohort.user-role-owner',
    [UserRoles.MEMBER]: 'common.member-details.cohort.user-roles-member'
  },
  [Routes.LIST]: {
    [UserRoles.OWNER]: 'common.member-details.sack.user-roles-owner',
    [UserRoles.MEMBER]: 'common.member-details.sack.user-roles-member'
  }
};

class MemberDetails extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isConfirmationVisible: false,
      isLeaveConfirmationVisible: false,
      isMemberInfoVisible: false,
      isOwnerInfoVisible: false,
      pending: false,
      pendingForLeaving: false
    };
  }

  handleConfirmationVisibility = () =>
    this.setState(({ isConfirmationVisible }) => ({
      isConfirmationVisible: !isConfirmationVisible
    }));

  handleMemberRemoving = () => {
    const {
      displayName,
      isOwner,
      match: {
        params: { id }
      },
      removeCohortMember,
      removeListMember,
      route,
      _id: userId
    } = this.props;

    const action =
      route === Routes.COHORT ? removeCohortMember : removeListMember;

    this.setState({ pending: true });

    action(id, displayName, userId, isOwner).finally(() =>
      this.setState({ pending: false })
    );
  };

  handleOwnerInfoVisibility = event => {
    event.stopPropagation();
    this.setState(({ isOwnerInfoVisible }) => ({
      isOwnerInfoVisible: !isOwnerInfoVisible
    }));
  };

  handleMemberInfoVisibility = event => {
    event.stopPropagation();
    this.setState(({ isMemberInfoVisible }) => ({
      isMemberInfoVisible: !isMemberInfoVisible
    }));
  };

  removeRole = (isCurrentUserRoleChanging, removeRoleAction, userName) => (
    id,
    userId
  ) => removeRoleAction(id, userId, userName, isCurrentUserRoleChanging);

  changeCohortRole = () => {
    const {
      _id: userId,
      addOwnerRoleInCohort,
      currentUser: { id: currentUserId },
      displayName,
      isOwner,
      match: {
        params: { id }
      },
      removeOwnerRoleInCohort
    } = this.props;
    const isCurrentUserRoleChanging = currentUserId === userId;

    this.setState({ pending: true });

    const action = isOwner
      ? this.removeRole(
          isCurrentUserRoleChanging,
          removeOwnerRoleInCohort,
          displayName
        )
      : addOwnerRoleInCohort;

    action(id, userId, displayName).finally(() =>
      this.setState({ pending: false })
    );
  };

  changeListRole = selectedRole => {
    const {
      _id: userId,
      addMemberRoleInList,
      addOwnerRoleInList,
      currentUser: { id: currentUserId },
      displayName,
      isMember,
      isOwner,
      match: {
        params: { id }
      },
      removeMemberRoleInList,
      removeOwnerRoleInList
    } = this.props;
    const isCurrentUserRoleChanging = currentUserId === userId;
    let action;

    this.setState({ pending: true });

    switch (selectedRole) {
      case UserRoles.OWNER:
        action = isOwner
          ? this.removeRole(
              isCurrentUserRoleChanging,
              removeOwnerRoleInList,
              displayName
            )
          : addOwnerRoleInList;
        break;
      case UserRoles.MEMBER:
        action = isMember
          ? this.removeRole(
              isCurrentUserRoleChanging,
              removeMemberRoleInList,
              displayName
            )
          : addMemberRoleInList;
        break;
      default:
        break;
    }

    action(id, userId, displayName).finally(() =>
      this.setState({ pending: false })
    );
  };

  handleChangingRoles = event => {
    event.stopPropagation();
    const {
      target: { value: selectedRole }
    } = event;
    const { route } = this.props;

    switch (route) {
      case Routes.COHORT:
        this.changeCohortRole();
        break;
      case Routes.LIST:
        this.changeListRole(selectedRole);
        break;
      default:
        break;
    }
  };

  handleCohortLeave = () => {
    const {
      currentUser: { id: currentUserId, name },
      leaveCohort,
      match: {
        params: { id }
      }
    } = this.props;

    this.setState({ pendingForLeaving: true });

    return leaveCohort(id, currentUserId, name).finally(() => {
      this.setState({ pendingForLeaving: false });
    });
  };

  handleLeaveConfirmationVisibility = () =>
    this.setState(({ isLeaveConfirmationVisible }) => ({
      isLeaveConfirmationVisible: !isLeaveConfirmationVisible
    }));

  renderChangeRoleOption = (role, isInfoVisible, checked) => {
    const { pending } = this.state;
    const { route } = this.props;
    const disabled = route === Routes.COHORT && role === UserRoles.MEMBER;
    const label =
      role === UserRoles.OWNER
        ? UserRolesToDisplay.OWNER
        : UserRolesToDisplay.MEMBER;

    return (
      <Fragment>
        <div className="member-details__option-header">
          <button
            className="member-details__info-button"
            disabled={pending}
            onClick={
              role === UserRoles.OWNER
                ? this.handleOwnerInfoVisibility
                : this.handleMemberInfoVisibility
            }
            type="button"
          >
            <span>
              <InfoIcon />
            </span>
          </button>
          <SwitchButton
            checked={checked}
            disabled={pending || disabled}
            label={label}
            onChange={disabled ? null : this.handleChangingRoles}
            value={role}
          />
        </div>
        {isInfoVisible && (
          <p className="member-details__role-description">
            <FormattedMessage id={infoText[route][role]} />
          </p>
        )}
      </Fragment>
    );
  };

  renderRemoveOption = () => {
    const { isConfirmationVisible, pending } = this.state;
    const { displayName } = this.props;

    return isConfirmationVisible ? (
      <div className="member-details__confirmation">
        <h4>{`Do you really want to remove ${displayName}?`}</h4>
        <button
          className="primary-button"
          onClick={this.handleMemberRemoving}
          type="button"
        >
          <FormattedMessage id="common.button.confirm" />
        </button>
        <button
          className="primary-button"
          onClick={this.handleConfirmationVisibility}
          type="button"
        >
          <FormattedMessage id="common.button.cancel" />
        </button>
      </div>
    ) : (
      <button
        className="member-details__button primary-button"
        disabled={pending}
        onClick={this.handleConfirmationVisibility}
        type="button"
      >
        <FormattedMessage id="common.member-details.remove" />
      </button>
    );
  };

  renderHeader = () => {
    const {
      avatarUrl,
      displayName,
      isCohortList,
      isGuest,
      isMember,
      isOwner
    } = this.props;
    let roleToDisplay = (
      <FormattedMessage id="common.member-details.role-viewer" />
    );

    if (isMember) {
      roleToDisplay = (
        <FormattedMessage id="common.member-details.role-member" />
      );
    }

    if (isOwner) {
      roleToDisplay = (
        <FormattedMessage id="common.member-details.role-owner" />
      );
    }

    return (
      <header className="member-details__header">
        <div className="member-details__avatar">
          <Avatar
            avatarUrl={avatarUrl}
            className="member-details__image"
            name={displayName}
          />
        </div>
        <div>
          <h3 className="member-details__name">{displayName}</h3>
          <p className="member-details__role">
            {roleToDisplay}
            {isGuest && isCohortList && (
              <FormattedMessage id="common.member-details.role-guest" />
            )}
          </p>
        </div>
      </header>
    );
  };

  renderDetails = () => {
    const { isMemberInfoVisible, isOwnerInfoVisible } = this.state;
    const {
      _id: userId,
      currentUser: { id: currentUserId },
      isGuest,
      isMember,
      isOwner,
      route,
      type
    } = this.props;
    const isRemoveOptionVisible =
      (route === Routes.COHORT || type === ListType.LIMITED || isGuest) &&
      userId !== currentUserId;

    return (
      <ul className="member-details__options">
        <li className="member-details__option">
          {this.renderChangeRoleOption(
            UserRoles.OWNER,
            isOwnerInfoVisible,
            isOwner
          )}
        </li>
        {route === Routes.LIST && (
          <li className="member-details__option">
            {this.renderChangeRoleOption(
              UserRoles.MEMBER,
              isMemberInfoVisible,
              isMember
            )}
          </li>
        )}
        {isRemoveOptionVisible && (
          <li className="member-details__option member-details__option--removing">
            {this.renderRemoveOption()}
          </li>
        )}
      </ul>
    );
  };

  renderLeaveOption = () => {
    const {
      _id: userId,
      currentUser: { id: currentUserId },
      onClose,
      route
    } = this.props;
    const { isLeaveConfirmationVisible, pendingForLeaving } = this.state;

    if (userId === currentUserId) {
      return (
        <div className="member-details__leave-box">
          {isLeaveConfirmationVisible ? (
            <div className="member-details__leave-box-confirmation">
              Do you really want to leave?
              <footer className="member-details__leave-box-confirmation-footer">
                <PendingButton
                  className="primary-button"
                  onClick={this.handleCohortLeave}
                  pending={pendingForLeaving}
                >
                  Confirm
                </PendingButton>
                <button
                  className="primary-button"
                  onClick={onClose}
                  type="button"
                >
                  cancel
                </button>
              </footer>
            </div>
          ) : (
            <button
              className="primary-button"
              onClick={
                route === Routes.LIST
                  ? null
                  : this.handleLeaveConfirmationVisibility
              }
              type="button"
            >
              Leave
              {route === Routes.LIST ? ' list' : ' cohort'}
            </button>
          )}
        </div>
      );
    }
  };

  render() {
    const { isCurrentUserAnOwner, onClose } = this.props;
    const { pending } = this.state;

    return (
      <Fragment>
        <div
          className={classNames('member-details', {
            'member-details--flexible': !isCurrentUserAnOwner
          })}
        >
          <button
            className="member-details__close"
            onClick={onClose}
            type="button"
          >
            <CloseIcon />
          </button>
          <div className="member-details__details">
            {this.renderHeader()}
            <div className="member-details__panel">
              {isCurrentUserAnOwner && this.renderDetails()}
              {pending && <Preloader />}
            </div>
          </div>
          {this.renderLeaveOption()}
        </div>
      </Fragment>
    );
  }
}

MemberDetails.propTypes = {
  _id: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  currentUser: UserPropType.isRequired,
  displayName: PropTypes.string.isRequired,
  isCohortList: PropTypes.bool,
  isCurrentUserAnOwner: PropTypes.bool.isRequired,
  isGuest: PropTypes.bool,
  isMember: PropTypes.bool,
  isOwner: PropTypes.bool,
  match: RouterMatchPropType.isRequired,
  route: PropTypes.string,
  type: PropTypes.string,

  addMemberRoleInList: PropTypes.func.isRequired,
  addOwnerRoleInCohort: PropTypes.func.isRequired,
  addOwnerRoleInList: PropTypes.func.isRequired,
  leaveCohort: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  removeCohortMember: PropTypes.func.isRequired,
  removeListMember: PropTypes.func.isRequired,
  removeMemberRoleInList: PropTypes.func.isRequired,
  removeOwnerRoleInCohort: PropTypes.func.isRequired,
  removeOwnerRoleInList: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  currentUser: getCurrentUser(state)
});

export default withRouter(
  connect(
    mapStateToProps,
    {
      addMemberRoleInList,
      addOwnerRoleInCohort,
      addOwnerRoleInList,
      leaveCohort,
      removeCohortMember,
      removeListMember,
      removeMemberRoleInList,
      removeOwnerRoleInCohort,
      removeOwnerRoleInList
    }
  )(MemberDetails)
);
