import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';

import TilesViewItem from 'common/components/TilesViewItem';
import MessageBox from 'common/components/MessageBox';
import { MessageType, Routes } from 'common/constants/enums';
import CardPlus from 'common/components/CardPlus';
import {
  addListToFavourites,
  removeListFromFavourites
} from 'modules/list/model/actions';
import {
  addCohortToFavourites,
  removeCohortFromFavourites
} from 'modules/cohort/model/actions';
import Preloader from 'common/components/Preloader';
import ListViewItem from 'common/components/ListViewItem';

class CollectionView extends PureComponent {
  handleFavClick = (itemId, isFavourite) => event => {
    event.stopPropagation();
    const {
      addCohortToFavourites,
      addListToFavourites,
      removeCohortFromFavourites,
      removeListFromFavourites,
      route
    } = this.props;

    let action;
    switch (route) {
      case Routes.LIST:
        action = isFavourite ? removeListFromFavourites : addListToFavourites;
        break;
      case Routes.COHORT:
        action = isFavourite
          ? removeCohortFromFavourites
          : addCohortToFavourites;
        break;
      default:
        break;
    }
    return action(itemId);
  };

  handleCardClick = (route, itemId) => () => {
    const { history } = this.props;
    history.push(`/${route}/${itemId}`);
  };

  renderAddNew = () => {
    const { onAddNew } = this.props;

    return (
      <li className="collection__item">
        <button className="collection__button" onClick={onAddNew} type="button">
          <CardPlus />
        </button>
      </li>
    );
  };

  renderAsList = () => {
    const { color, items, route } = this.props;

    return _map(items, item => {
      const { _id, isFavourite } = item;

      return (
        <li className="collection__item" key={_id}>
          <ListViewItem
            color={color}
            item={item}
            onCardClick={this.handleCardClick(route, _id)}
            onFavClick={this.handleFavClick(_id, isFavourite)}
            route={route}
          />
        </li>
      );
    });
  };

  renderAsTiles = () => {
    const { color, items, route } = this.props;

    return _map(items, item => {
      const { _id, isFavourite } = item;

      return (
        <li className="collection__item" key={_id}>
          <TilesViewItem
            color={color}
            item={item}
            onCardClick={this.handleCardClick(route, _id)}
            onFavClick={this.handleFavClick(_id, isFavourite)}
            route={route}
          />
        </li>
      );
    });
  };

  render() {
    const {
      icon,
      items,
      listMode,
      name,
      onAddNew,
      pending,
      placeholder
    } = this.props;

    return (
      <div className="collection">
        <h2 className="collection__heading">
          {icon}
          {name}
        </h2>
        <div className="collection__body">
          <ul className={listMode ? 'collection__list' : 'collection__tiles'}>
            {onAddNew && this.renderAddNew()}
            {listMode ? this.renderAsList() : this.renderAsTiles()}
          </ul>
          {pending && <Preloader />}
          {_isEmpty(items) && !pending && (
            <MessageBox message={placeholder} type={MessageType.INFO} />
          )}
        </div>
      </div>
    );
  }
}

CollectionView.propTypes = {
  color: PropTypes.string.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func
  }),
  icon: PropTypes.node.isRequired,
  items: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  listMode: PropTypes.bool,
  name: PropTypes.string.isRequired,
  pending: PropTypes.bool,
  placeholder: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,

  addCohortToFavourites: PropTypes.func,
  addListToFavourites: PropTypes.func,
  onAddNew: PropTypes.func,
  removeCohortFromFavourites: PropTypes.func,
  removeListFromFavourites: PropTypes.func
};

export default withRouter(
  connect(
    null,
    {
      addCohortToFavourites,
      addListToFavourites,
      removeCohortFromFavourites,
      removeListFromFavourites
    }
  )(CollectionView)
);
