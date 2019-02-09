import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import MenuIcon from 'assets/images/ellipsis-v-solid.svg';

class DropdownMenu extends Component {
  state = {
    hideMenu: true
  };

  hideMenu = () => {
    this.setState({ hideMenu: true });
    document.removeEventListener('click', this.hideMenu);
    document.removeEventListener('keydown', this.onPressEscape);
  };

  showMenu = () => {
    this.setState({ hideMenu: false });
    document.addEventListener('click', this.hideMenu);
    document.addEventListener('keydown', this.onPressEscape);
  };

  onPressEscape = e => {
    if (e.keyCode === 27) this.hideMenu();
  };

  toggleMenuVisibility = () => {
    const { hideMenu } = this.state;
    if (hideMenu) {
      this.showMenu();
    } else {
      this.hideMenu();
    }
  };

  render() {
    const { hideMenu } = this.state;
    const { children, menuItems } = this.props;
    const menuButton = children || (
      <div className="dropdown__wrapper">
        <img alt="Menu Icon" className="dropdown__menu-icon" src={MenuIcon} />
      </div>
    );
    return (
      <a className="dropdown" href="#!" onClick={this.toggleMenuVisibility}>
        {menuButton}
        <div
          className={classNames('dropdown__menu-wrapper', {
            hidden: hideMenu
          })}
        >
          <ul className="dropdown__menu">
            {menuItems.map(item => (
              <li className="dropdown__menu-item" key={item.label}>
                <button
                  className="dropdown__menu-button"
                  onClick={item.callback}
                  type="button"
                >
                  {item.label}
                  {item.icon && (
                    <img
                      alt={`${item.label} icon`}
                      className="dropdown__menu-icon"
                      src={item.icon}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </a>
    );
  }
}

DropdownMenu.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      label: PropTypes.string,

      callback: PropTypes.func
    })
  ).isRequired
};

export default DropdownMenu;
