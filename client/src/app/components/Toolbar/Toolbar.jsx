import React, { PureComponent, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { COMPANY_PAGE_URL } from 'common/constants/variables';
import CompanyLogo from 'assets/images/company_logo.png';
import { SvgIcon } from 'assets/images/icons';
import PlusIcon from 'assets/images/plus-solid.svg';
import UserBar from './components/UserBar';
import AppLogo from 'common/components/AppLogo';
import CreationForm from 'common/components/CreationForm';
import { createShoppingList } from 'modules/shopping-list/model/actions';
import { createCohort } from 'modules/cohort/model/actions';
import { getCurrentUser } from 'modules/authorization/model/selectors';
import { UserPropType } from 'common/constants/propTypes';
import Overlay, { OverlayStyleType } from 'common/components/Overlay';
import { IconType } from 'common/constants/enums';

class Toolbar extends PureComponent {
  state = {
    cohortFormVisibility: false,
    overlayVisibility: false,
    shoppingFormVisibility: false,
    userBarMenuVisibility: false
  };

  componentDidMount() {
    document.addEventListener('click', this.clickListener);
    document.addEventListener('keydown', this.escapeListener);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.clickListener);
    document.removeEventListener('keydown', this.escapeListener);
  }

  clickListener = event => {
    const { className } = event.target;
    className.length > 0 && className.includes('overlay')
      ? this.hideOverlayAndForm()
      : null;
  };

  escapeListener = event => {
    event.code === 'Escape' ? this.hideOverlayAndForm() : null;
  };

  hideOverlayAndForm = () => {
    this.setState({
      cohortFormVisibility: false,
      overlayVisibility: false,
      shoppingFormVisibility: false,
      userBarMenuVisibility: false
    });
  };

  handleShoppingListFormVisibility = () => {
    const { shoppingFormVisibility } = this.state;

    this.setState({
      cohortFormVisibility: false,
      overlayVisibility: !shoppingFormVisibility,
      shoppingFormVisibility: !shoppingFormVisibility,
      userBarMenuVisibility: false
    });
  };

  handleCohortFormVisibility = () => {
    const { cohortFormVisibility } = this.state;

    this.setState({
      cohortFormVisibility: !cohortFormVisibility,
      overlayVisibility: !cohortFormVisibility,
      shoppingFormVisibility: false,
      userBarMenuVisibility: false
    });
  };

  handleShoppingListSubmission = (title, description) => {
    const {
      createShoppingList,
      currentUser: { id }
    } = this.props;
    createShoppingList(title, description, id);
    this.hideOverlayAndForm();
  };

  handleCohortSubmission = (title, description) => {
    const {
      createCohort,
      currentUser: { id }
    } = this.props;
    createCohort(title, description, id);
    this.hideOverlayAndForm();
  };

  handleUserBarMenu = isVisible => {
    this.setState({
      cohortFormVisibility: false,
      overlayVisibility: isVisible,
      shoppingFormVisibility: false,
      userBarMenuVisibility: isVisible
    });
  };

  renderCreateCohortOption = () => {
    const { cohortFormVisibility } = this.state;
    return (
      <li className="toolbar__icon-wrapper z-index-high">
        <button
          className="toolbar__icon-link"
          onClick={this.handleCohortFormVisibility}
          type="button"
        >
          <SvgIcon icon={IconType.COHORT} />
          <img alt="Plus icon" className="toolbar__icon-plus" src={PlusIcon} />
        </button>
        <div
          className={classNames('toolbar__form', {
            hidden: !cohortFormVisibility
          })}
        >
          <CreationForm
            label="Create new cohort"
            onSubmit={this.handleCohortSubmission}
            type="menu"
          />
        </div>
      </li>
    );
  };

  renderCreateListOption = () => {
    const { shoppingFormVisibility } = this.state;
    return (
      <li className="toolbar__icon-wrapper z-index-high">
        <button
          className="toolbar__icon-link"
          onClick={this.handleShoppingListFormVisibility}
          type="button"
        >
          <SvgIcon icon={IconType.LIST} />
          <img alt="Plus Icon" className="toolbar__icon-plus" src={PlusIcon} />
        </button>
        <div
          className={classNames('toolbar__form', {
            hidden: !shoppingFormVisibility
          })}
        >
          <CreationForm
            label="Create new shopping list"
            onSubmit={this.handleShoppingListSubmission}
            type="menu"
          />
        </div>
      </li>
    );
  };

  render() {
    const { overlayVisibility, userBarMenuVisibility } = this.state;
    const { isHomePage, menuItems } = this.props;

    return (
      <Fragment>
        <div className="toolbar">
          <div className="wrapper toolbar__wrapper">
            <ul className="toolbar__left">
              <li>
                <a
                  className="toolbar__company-link"
                  href={COMPANY_PAGE_URL}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <img
                    alt="Company logo"
                    className="toolbar__company-logo"
                    src={CompanyLogo}
                  />
                </a>
              </li>
              {isHomePage && (
                <Fragment>
                  {this.renderCreateCohortOption()}
                  {this.renderCreateListOption()}
                </Fragment>
              )}
              {!isHomePage && (
                <Fragment>
                  <li className="toolbar__icon-wrapper">
                    <Link className="toolbar__icon-link" to="/dashboard">
                      <SvgIcon icon="home" />
                    </Link>
                  </li>
                  {menuItems &&
                    menuItems.map(item => (
                      <li
                        className="toolbar__icon-wrapper z-index-high"
                        key={item.label}
                      >
                        <button
                          className="toolbar__icon-link"
                          onClick={item.onClick}
                          type="button"
                        >
                          <SvgIcon icon={item.mainIcon} />
                          {item.supplementIconSrc && (
                            <img
                              alt="Plus icon"
                              className="toolbar__icon-plus"
                              src={item.supplementIconSrc}
                            />
                          )}
                        </button>
                      </li>
                    ))}
                </Fragment>
              )}
            </ul>
            <div className="toolbar__logo">
              <AppLogo />
            </div>
            <div className="toolbar__right">
              <UserBar
                isMenuVisible={userBarMenuVisibility}
                onClick={this.handleUserBarMenu}
              />
            </div>
          </div>
        </div>
        {overlayVisibility && <Overlay type={OverlayStyleType.LIGHT} />}
      </Fragment>
    );
  }
}

Toolbar.propTypes = {
  currentUser: UserPropType.isRequired,
  isHomePage: PropTypes.bool,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      mainIcon: PropTypes.string.isRequired,
      supplementIconSrc: PropTypes.string,

      onClick: PropTypes.func.isRequired
    })
  ),

  createCohort: PropTypes.func.isRequired,
  createShoppingList: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  currentUser: getCurrentUser(state)
});

export default connect(
  mapStateToProps,
  { createCohort, createShoppingList }
)(Toolbar);
