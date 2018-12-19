import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { fetchItems } from './actions';
import { getItems, getFetchStatus } from '../selectors';
import { statusType } from '../common/enums';
import Footer from '../components/Footer';
import Header from '../components/Header';
import MessageBox from '../components/MessageBox';
import ProductsContainer from '../components/ProductsContainer';
import Preloader from '../components/Preloader';
import InputBar from '../components/InputBar/index';

class App extends Component {
  componentDidMount() {
    this.fetchItems();
  }

  fetchItems = () => {
    const { fetchItems } = this.props;

    fetchItems();
  };

  render() {
    const { fetchStatus, items } = this.props;
    const reversedItem = items.reverse();
    const archiveList = reversedItem.filter(item => item.isOrdered);
    const shoppingList = reversedItem.filter(item => !item.isOrdered);

    return (
      <div
        className={classNames('app-wrapper', {
          overlay: fetchStatus === statusType.PENDING
        })}
      >
        <Header />
        {fetchStatus === statusType.ERROR && (
          <MessageBox
            message="Fetching failed. Try to refresh the page."
            type="error"
          />
        )}
        <InputBar />
        <ProductsContainer products={shoppingList} />
        <ProductsContainer archived products={archiveList} />
        <Footer />
        {fetchStatus === statusType.PENDING && (
          <Preloader message="Fetching data..." />
        )}
      </div>
    );
  }
}

App.propTypes = {
  fetchStatus: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),

  fetchItems: PropTypes.func
};

const mapStateToProps = state => ({
  fetchStatus: getFetchStatus(state),
  items: getItems(state)
});

export default connect(
  mapStateToProps,
  { fetchItems }
)(App);
