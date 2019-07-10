import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import _flowRight from 'lodash/flowRight';

import ItemsContainer from 'modules/list/components/ItemsContainer';
import {
  getDoneItems,
  getList,
  getMembers,
  getUndoneItems
} from 'modules/list/model/selectors';
import InputBar from 'modules/list/components/Items/InputBar';
import {
  addListViewerWS,
  archiveList,
  fetchListData,
  leaveList
} from 'modules/list/model/actions';
import Dialog, { DialogContext } from 'common/components/Dialog';
import ArchivedList from 'modules/list/components/ArchivedList';
import {
  IntlPropType,
  RouterMatchPropType,
  UserPropType
} from 'common/constants/propTypes';
import MembersBox from 'common/components/Members';
import { Routes } from 'common/constants/enums';
import ListHeader from './components/ListHeader';
import Preloader from 'common/components/Preloader';
import Breadcrumbs from 'common/components/Breadcrumbs';
import ArchivedItemsContainer from 'modules/list/components/ArchivedItemsContainer';
import {
  addItemWS,
  archiveItemWS,
  deleteItemWS,
  restoreItemWS
} from './components/Items/model/actions';
import { ItemActionTypes } from 'modules/list/components/Items/model/actionTypes';
import { getCurrentUser } from 'modules/authorization/model/selectors';
import { ListType } from './consts';
import withSocket from 'common/hoc/withSocket';
import { CohortActionTypes } from 'modules/cohort/model/actionTypes';
import { ListActionTypes } from 'modules/list/model/actionTypes';

class List extends Component {
  state = {
    breadcrumbs: [],
    dialogContext: null,
    isMembersBoxVisible: false,
    pendingForDetails: false,
    pendingForListArchivization: false
  };

  componentDidMount() {
    this.setState({ pendingForDetails: true });

    this.fetchData().finally(() => {
      this.setState({ pendingForDetails: false });
      this.handleBreadcrumbs();
      this.handleRoomConnection();
      this.receiveWSEvents();
    });
  }

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { id: prevListId }
      }
    } = prevProps;
    const {
      match: {
        params: { id: listId }
      },
      socket
    } = this.props;

    if (prevListId !== listId) {
      socket.emit('leavingListRoom', prevListId);
      this.fetchData();
    }
  }

  componentWillUnmount() {
    const {
      match: {
        params: { id: listId }
      },
      socket
    } = this.props;

    socket.emit('leavingListRoom', listId);
  }

  handleRoomConnection = () => {
    const {
      list: { _id: listId },
      socket
    } = this.props;

    socket.emit('joinListRoom', `list-${listId}`);
  };

  receiveWSEvents = () => {
    const {
      addItemWS,
      addListViewerWS,
      archiveItemWS,
      deleteItemWS,
      restoreItemWS,
      socket
    } = this.props;

    socket.on(ItemActionTypes.ADD_SUCCESS, data => {
      const { item, listId } = data;

      addItemWS(item, listId);
    });

    socket.on(ItemActionTypes.ARCHIVE_SUCCESS, data => {
      const { itemId, listId } = data;

      archiveItemWS(listId, itemId);
    });

    socket.on(ItemActionTypes.DELETE_SUCCESS, data => {
      const { itemId, listId } = data;

      deleteItemWS(listId, itemId);
    });

    socket.on(ItemActionTypes.RESTORE_SUCCESS, data => {
      const { itemId, listId } = data;

      restoreItemWS(listId, itemId);
    });

    socket.on(CohortActionTypes.ADD_MEMBER_SUCCESS, data => {
      const { listId, member } = data;

      addListViewerWS(listId, member);
    });

    socket.on(ListActionTypes.ADD_VIEWER_SUCCESS, data => {
      const { listId, member } = data;

      addListViewerWS(listId, member);
    });
  };

  handleBreadcrumbs = () => {
    const {
      list: { cohortId, cohortName, isGuest, name, _id: listId }
    } = this.props;

    if (cohortId) {
      this.setState({
        breadcrumbs: [
          { name: Routes.COHORTS, path: `/${Routes.COHORTS}` },
          {
            name: cohortName,
            path: isGuest ? null : `/${Routes.COHORT}/${cohortId}`
          },
          { name, path: `/${Routes.LIST}/${listId}` }
        ]
      });

      return;
    }

    this.setState({
      breadcrumbs: [
        { name: Routes.DASHBOARD, path: `/${Routes.DASHBOARD}` },
        { name, path: `/${Routes.LIST}/${listId}` }
      ]
    });
  };

  fetchData = () => {
    const {
      fetchListData,
      match: {
        params: { id }
      }
    } = this.props;

    return fetchListData(id);
  };

  handleListArchivization = listId => () => {
    const {
      archiveList,
      list: { isOwner, name }
    } = this.props;

    if (isOwner) {
      this.setState({ pendingForListArchivization: true });

      archiveList(listId, name).catch(() => {
        this.setState({ pendingForListArchivization: false });
        this.hideDialog();
      });
    }
  };

  handleDialogContext = context => () =>
    this.setState({ dialogContext: context });

  hideDialog = () => this.handleDialogContext(null)();

  handleMembersBoxVisibility = () =>
    this.setState(({ isMembersBoxVisible }) => ({
      isMembersBoxVisible: !isMembersBoxVisible
    }));

  handleLeave = () => {
    const {
      currentUser: { id: currentUserId, name },
      leaveList,
      list: { cohortId },
      match: {
        params: { id }
      }
    } = this.props;

    return leaveList(id, currentUserId, cohortId, name);
  };

  renderBreadcrumbs = () => {
    const { breadcrumbs } = this.state;
    const {
      list: { isGuest }
    } = this.props;

    return <Breadcrumbs breadcrumbs={breadcrumbs} isGuest={isGuest} />;
  };

  render() {
    const {
      dialogContext,
      isMembersBoxVisible,
      pendingForDetails,
      pendingForListArchivization
    } = this.state;
    const {
      doneItems,
      intl: { formatMessage },
      match: {
        params: { id: listId }
      },
      list,
      members,
      undoneItems
    } = this.props;

    if (!list) {
      return null;
    }

    const { cohortId, isArchived, isMember, isOwner, name, type } = list;
    const isCohortList = cohortId !== null && cohortId !== undefined;

    return (
      <Fragment>
        {this.renderBreadcrumbs()}
        {isArchived ? (
          <ArchivedList listId={listId} name={name} />
        ) : (
          <div className="wrapper">
            <div className="list">
              <ListHeader
                details={list}
                isCohortList={isCohortList}
                updateBreadcrumbs={this.handleBreadcrumbs}
              />
              <div className="list__details">
                <div className="list__items">
                  <ItemsContainer isMember={isMember} items={undoneItems}>
                    {isMember && <InputBar />}
                  </ItemsContainer>
                  <ItemsContainer
                    isMember={isMember}
                    items={doneItems}
                    ordered
                  />
                </div>
                {isMember && (
                  <ArchivedItemsContainer isMember={isMember} name={name} />
                )}
                {!isArchived && isOwner && (
                  <button
                    className="link-button"
                    onClick={this.handleDialogContext(DialogContext.ARCHIVE)}
                    type="button"
                  >
                    <FormattedMessage
                      id="list.index.arch-sack"
                      values={{ name }}
                    />
                  </button>
                )}
                <div className="list__members">
                  <button
                    className="link-button"
                    onClick={this.handleMembersBoxVisibility}
                    type="button"
                  >
                    <FormattedMessage
                      id={
                        isMembersBoxVisible
                          ? 'list.index.hide-members'
                          : 'list.index.show-members'
                      }
                    />
                  </button>
                  {isMembersBoxVisible && (
                    <MembersBox
                      isCohortList={isCohortList}
                      isCurrentUserAnOwner={isOwner}
                      isMember={isMember}
                      isPrivateList={type === ListType.LIMITED}
                      members={members}
                      onListLeave={this.handleLeave}
                      route={Routes.LIST}
                      type={type}
                    />
                  )}
                </div>
                {pendingForDetails && <Preloader />}
              </div>
            </div>
          </div>
        )}
        {dialogContext === DialogContext.ARCHIVE && (
          <Dialog
            onCancel={this.hideDialog}
            onConfirm={this.handleListArchivization(listId)}
            pending={pendingForListArchivization}
            title={formatMessage(
              {
                id: pendingForListArchivization
                  ? 'list.index.archivization'
                  : 'list.index.question'
              },
              { name }
            )}
          />
        )}
      </Fragment>
    );
  }
}

List.propTypes = {
  currentUser: UserPropType.isRequired,
  doneItems: PropTypes.arrayOf(PropTypes.object),
  intl: IntlPropType.isRequired,
  list: PropTypes.objectOf(PropTypes.any),
  match: RouterMatchPropType.isRequired,
  members: PropTypes.objectOf(PropTypes.object),
  socket: PropTypes.objectOf(PropTypes.any),
  undoneItems: PropTypes.arrayOf(PropTypes.object),

  addItemWS: PropTypes.func.isRequired,
  addListViewerWS: PropTypes.func.isRequired,
  archiveItemWS: PropTypes.func.isRequired,
  archiveList: PropTypes.func.isRequired,
  deleteItemWS: PropTypes.func.isRequired,
  fetchListData: PropTypes.func.isRequired,
  leaveList: PropTypes.func.isRequired,
  restoreItemWS: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  const {
    match: {
      params: { id }
    }
  } = ownProps;

  return {
    currentUser: getCurrentUser(state),
    doneItems: getDoneItems(state, id),
    list: getList(state, id),
    members: getMembers(state, id),
    undoneItems: getUndoneItems(state, id)
  };
};

export default _flowRight(
  withSocket,
  injectIntl,
  withRouter,
  connect(
    mapStateToProps,
    {
      addItemWS,
      addListViewerWS,
      archiveItemWS,
      archiveList,
      deleteItemWS,
      fetchListData,
      leaveList,
      restoreItemWS
    }
  )
)(List);
