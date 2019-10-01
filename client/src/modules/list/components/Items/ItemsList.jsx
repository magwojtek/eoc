import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import _flowRight from 'lodash/flowRight';

import ListItem from 'modules/list/components/Items/ListItem';
import ListArchivedItem from 'modules/list/components/Items/ListArchivedItem';
import MessageBox from 'common/components/MessageBox';
import { MessageType } from 'common/constants/enums';
import { disableItemAnimations } from './model/actions';
import { RouterMatchPropType } from 'common/constants/propTypes';
import { DISPLAY_LIMIT } from 'common/constants/variables';
import { updateLimit } from 'modules/list/model/actions';

class ItemsList extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      displayItems: null,
      limit: DISPLAY_LIMIT
    };
  }

  componentDidMount() {
    this.prepareDisplayItems();
  }

  componentDidUpdate(previousProps) {
    const { items: previousItems } = previousProps;
    const { items } = this.props;

    if (previousItems.length !== items.length) {
      this.prepareDisplayItems();
    }
  }

  prepareDisplayItems = () => {
    const { limit } = this.state;
    const { items } = this.props;
    const displayItems = items.slice(0, limit).map(item => item);

    this.setState({ displayItems }, this.updateDisplayItemsCount);
    this.handleLimitUpdate();
  };

  /**
   * Do not remove handleLimitUpdate method,
   * it is necessary for animations to work
   */
  handleLimitUpdate = () => {
    const {
      archived: archivedItems,
      done: doneItems,
      match: {
        params: { id: listId }
      },
      updateLimit
    } = this.props;
    const { limit: currentLimit } = this.state;
    const limit = {};

    if (archivedItems) {
      limit.archivedLimit = currentLimit;
    } else if (doneItems) {
      limit.doneLimit = currentLimit;
    } else {
      limit.unhandledLimit = currentLimit;
    }

    updateLimit(limit, listId);
  };

  updateDisplayItemsCount = () => {
    const { onUpdateItemsCount } = this.props;
    const { displayItems } = this.state;

    onUpdateItemsCount(displayItems.length);
  };

  showMore = () =>
    this.setState(
      ({ limit }) => ({ limit: limit + DISPLAY_LIMIT }),
      this.prepareDisplayItems
    );

  showLess = () =>
    this.setState({ limit: DISPLAY_LIMIT }, this.prepareDisplayItems);

  handleDisableAnimations = item => () => {
    const { _id: itemId, animate } = item;
    if (animate) {
      const {
        disableItemAnimations,
        match: {
          params: { id: listId }
        }
      } = this.props;

      disableItemAnimations(itemId, listId);
    }
  };

  renderItems = () => {
    const { archived, isMember, items } = this.props;
    const { limit } = this.state;

    if (!items) {
      return null;
    }

    return archived ? (
      <ul className="items-list">
        <TransitionGroup component={null}>
          {items.slice(0, limit).map(item => (
            <CSSTransition
              classNames="animated-item"
              enter={item.animate}
              exit={item.animate}
              key={item._id}
              onEntered={this.handleDisableAnimations(item)}
              timeout={1000}
            >
              <ListArchivedItem
                data={item}
                isMember={isMember}
                key={item._id}
              />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </ul>
    ) : (
      <ul className="items-list">
        <TransitionGroup component={null}>
          {items.slice(0, limit).map(item => (
            <CSSTransition
              classNames="animated-item"
              enter={item.animate}
              exit={item.animate}
              key={item._id}
              onEntered={this.handleDisableAnimations(item)}
              timeout={2000}
            >
              <ListItem data={item} isMember={isMember} key={item._id} />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </ul>
    );
  };

  render() {
    const { archived, items } = this.props;
    const { limit } = this.state;
    const messageId = archived
      ? 'list.items-list.message-no-arch-items'
      : 'list.items-list.message-no-items';

    return (
      <Fragment>
        {!items.length && (
          <MessageBox type={MessageType.INFO}>
            <FormattedMessage id={messageId} />
          </MessageBox>
        )}
        {this.renderItems()}
        {limit < items.length && (
          <button
            className="items__show-more"
            onClick={this.showMore}
            type="button"
          />
        )}
        {limit > DISPLAY_LIMIT && items.length > 3 && (
          <button
            className="items__show-less"
            onClick={this.showLess}
            type="button"
          />
        )}
      </Fragment>
    );
  }
}

ItemsList.propTypes = {
  archived: PropTypes.bool,
  done: PropTypes.bool,
  isMember: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.object),
  match: RouterMatchPropType.isRequired,

  disableItemAnimations: PropTypes.func.isRequired,
  onUpdateItemsCount: PropTypes.func.isRequired,
  updateLimit: PropTypes.func.isRequired
};

export default _flowRight(
  withRouter,
  connect(
    null,
    { disableItemAnimations, updateLimit }
  )
)(ItemsList);
