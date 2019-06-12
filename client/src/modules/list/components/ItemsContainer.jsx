import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _sortBy from 'lodash/sortBy';
import { injectIntl, FormattedMessage } from 'react-intl';

import ItemsList from 'modules/list/components/Items';
import SortBox from 'common/components/SortBox';
import { SortOrderType } from 'common/constants/enums';
import FilterBox from 'modules/list/components/FilterBox';
import { getCurrentUser } from 'modules/authorization/model/selectors';
import { IntlPropType } from 'common/constants/propTypes';

const SortOptionType = Object.freeze({
  NAME: 'name',
  DATE: 'createdAt',
  AUTHOR: 'author',
  VOTES: 'votes'
});

export const FilterOptionType = Object.freeze({
  MY_ITEMS: 'my_items',
  ALL_ITEMS: 'all_items'
});

const sortOptions = [
  { id: SortOptionType.AUTHOR },
  { id: SortOptionType.DATE },
  { id: SortOptionType.NAME },
  { id: SortOptionType.VOTES }
];

const filterOptions = [
  { id: FilterOptionType.ALL_ITEMS },
  { id: FilterOptionType.MY_ITEMS }
];

class ItemsContainer extends Component {
  state = {
    sortBy: SortOptionType.DATE,
    sortOrder: SortOrderType.DESCENDING,
    filterBy: FilterOptionType.ALL_ITEMS
  };

  onSortChange = (sortBy, sortOrder) => this.setState({ sortBy, sortOrder });

  sortItems = (items, sortBy, sortOrder) => {
    let result = [...items];

    switch (sortBy) {
      case SortOptionType.NAME:
        result = _sortBy(result, item => item.name.toLowerCase());
        break;
      case SortOptionType.AUTHOR:
        result = _sortBy(result, [
          item => item.authorName.toLowerCase(),
          item => item.name.toLowerCase()
        ]);
        break;
      case SortOptionType.DATE:
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateA - dateB;
        });
        break;
      case SortOptionType.VOTES:
        result.sort((a, b) => a.votesCount - b.votesCount);
        break;
      default:
        break;
    }

    return sortOrder === SortOrderType.ASCENDING ? result : result.reverse();
  };

  onFilterChange = filterBy => this.setState({ filterBy });

  filterItems = (items, filterBy) => {
    const {
      currentUser: { id }
    } = this.props;

    return filterBy === FilterOptionType.MY_ITEMS
      ? items.filter(item => item.authorId === id)
      : items;
  };

  renderHeadingText = () => {
    const { archived, ordered } = this.props;

    if (archived) {
      return <FormattedMessage id="list.items-container.arch-items" />;
    }

    return ordered ? (
      <FormattedMessage id="list.items-container.done" />
    ) : (
      <FormattedMessage id="list.items-container.unhandled" />
    );
  };

  render() {
    const {
      archived,
      children,
      isMember,
      items,
      intl: { formatMessage }
    } = this.props;
    const { filterBy, sortBy, sortOrder } = this.state;
    const filteredList = this.filterItems(items, filterBy);
    const sortedList = this.sortItems(filteredList, sortBy, sortOrder);

    return (
      <div className="items">
        <header className="items__header">
          <h2 className="items__heading items__heading--left">
            {this.renderHeadingText()}
          </h2>
          <div className="items__header-controls">
            <FilterBox
              filterBy={filterBy}
              label={formatMessage({ id: 'list.items-container.filter-box' })}
              onChange={this.onFilterChange}
              options={filterOptions}
            />
            <SortBox
              label={formatMessage({ id: 'list.items-container.sort-box' })}
              onChange={this.onSortChange}
              options={sortOptions}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </div>
        </header>
        {children}
        <div className="items__body">
          <ItemsList
            archived={archived}
            isMember={isMember}
            items={sortedList}
          />
        </div>
      </div>
    );
  }
}

ItemsContainer.propTypes = {
  archived: PropTypes.bool,
  children: PropTypes.node,
  currentUser: PropTypes.objectOf(PropTypes.string).isRequired,
  intl: IntlPropType.isRequired,
  isMember: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.object),
  ordered: PropTypes.bool
};

const mapStateToProps = state => ({
  currentUser: getCurrentUser(state)
});

export default injectIntl(connect(mapStateToProps)(ItemsContainer));
