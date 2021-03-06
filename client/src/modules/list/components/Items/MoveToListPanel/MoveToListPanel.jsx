import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _flowRight from 'lodash/flowRight';
import { FormattedMessage, injectIntl } from 'react-intl';

import Filter from 'common/components/Filter';
import { fetchAvailableLists } from 'modules/list/model/actions';
import { moveItemToList } from 'modules/list/components/Items/model/actions';
import { getListsNames } from 'modules/list/model/selectors';
import { IntlPropType, RouterMatchPropType } from 'common/constants/propTypes';
import { CloseIcon } from 'assets/images/icons';
import Confirmation from 'common/components/Confirmation';
import { AbortPromiseException } from 'common/exceptions/AbortPromiseException';
import { makeAbortablePromise } from 'common/utils/helpers';
import Lists from './Lists';
import './MoveToListPanel.scss';

const filterByFields = ['name'];

class MoveToListPanel extends PureComponent {
  pendingPromise = null;

  state = {
    isConfirmationVisible: false,
    listId: null,
    listName: null,
    listsToDisplay: [],
    pending: false
  };

  componentDidMount() {
    const { fetchAvailableLists, lists } = this.props;

    this.setState({ pending: true });

    this.pendingPromise = makeAbortablePromise(fetchAvailableLists());
    this.pendingPromise.promise
      .then(() => this.setState({ pending: false }))
      .catch(err => {
        if (!(err instanceof AbortPromiseException)) {
          this.setState({ pending: false });
        }
      });

    if (lists.length > 0) {
      this.setState({ listsToDisplay: lists });
    }
  }

  componentDidUpdate(prevProps) {
    const { lists: prevLists } = prevProps;
    const { lists } = this.props;

    if (!prevLists.length && lists.length) {
      this.handleFilterLists(lists);
    }
  }

  componentWillUnmount() {
    if (this.pendingPromise) {
      this.pendingPromise.abort();
    }
  }

  handleShowConfirmation = (listId, listName) => event => {
    event.preventDefault();

    this.setState({ isConfirmationVisible: true, listId, listName });
  };

  handleCloseConfirmation = () =>
    this.setState({
      isConfirmationVisible: false,
      listId: null,
      listName: null
    });

  handleClosePanel = event => {
    const { onClose } = this.props;

    this.handleCloseConfirmation;
    onClose(event);
  };

  handleFilterLists = listsToDisplay => this.setState({ listsToDisplay });

  handleMoveToList = event => {
    event.preventDefault();

    const { listId: newListId, listName } = this.state;
    const {
      data: { _id: itemId, name: itemName },
      lockItem,
      match: {
        params: { id: listId }
      },
      moveItemToList,
      unlockItem
    } = this.props;
    const notificationData = { item: itemName, list: listName };

    lockItem();

    return moveItemToList(itemId, listId, newListId, notificationData).finally(
      unlockItem
    );
  };

  render() {
    const {
      isConfirmationVisible,
      listName,
      listsToDisplay,
      pending
    } = this.state;
    const {
      data: { name: itemName },
      intl: { formatMessage },
      lists
    } = this.props;

    return (
      <div className="move-to-list-panel">
        {isConfirmationVisible ? (
          <Confirmation
            confirmLabel="list.list-item.move-button"
            onCancel={this.handleCloseConfirmation}
            onConfirm={this.handleMoveToList}
          >
            <FormattedMessage
              id="list.list-item.move-to-confirmation"
              values={{ item: itemName, list: listName }}
            />
          </Confirmation>
        ) : (
          <>
            <div className="move-to-list-panel__filter-box">
              <Filter
                autofocus
                buttonContent={<CloseIcon />}
                clearButtonLabel={formatMessage({
                  id: 'common.button.reset-filter'
                })}
                fields={filterByFields}
                onFilter={this.handleFilterLists}
                options={lists}
                placeholder={formatMessage({
                  id: 'list.list-item.input-find-list'
                })}
              />
              <button
                className="primary-button"
                onClick={this.handleClosePanel}
                type="button"
              >
                <FormattedMessage id="common.button.cancel" />
              </button>
            </div>
            <Lists
              lists={listsToDisplay}
              onClick={this.handleShowConfirmation}
              pending={pending}
            />
          </>
        )}
      </div>
    );
  }
}

MoveToListPanel.propTypes = {
  data: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
      PropTypes.number,
      PropTypes.object
    ])
  ),
  intl: IntlPropType.isRequired,
  lists: PropTypes.arrayOf(
    PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string })
  ).isRequired,
  lockItem: PropTypes.func.isRequired,
  match: RouterMatchPropType.isRequired,
  unlockItem: PropTypes.func.isRequired,

  fetchAvailableLists: PropTypes.func.isRequired,
  moveItemToList: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  const {
    match: {
      params: { id }
    }
  } = ownProps;

  return {
    lists: getListsNames(state, id)
  };
};

export default _flowRight(
  injectIntl,
  withRouter,
  connect(mapStateToProps, { fetchAvailableLists, moveItemToList })
)(MoveToListPanel);
