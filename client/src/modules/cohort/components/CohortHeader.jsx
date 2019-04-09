import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { CohortIcon } from 'assets/images/icons';
import { updateCohort } from '../model/actions';
import { RouterMatchPropType } from 'common/constants/propTypes';
import { whiteSpaceOnly } from 'common/utils/helpers';
import NameInput from 'common/components/NameInput';
import DescriptionTextarea from 'common/components/DescriptionTextarea';

class CohortHeader extends PureComponent {
  constructor(props) {
    super(props);

    const {
      details: { description, name }
    } = this.props;
    const trimmedDescription = description.trim();

    this.state = {
      description: trimmedDescription,
      isDescriptionTextareaVisible: false,
      isNameInputVisible: false,
      name
    };
  }

  handleClick = (event, isClickedOutside) => {
    const {
      isDescriptionTextareaVisible,
      isNameInputVisible,
      name
    } = this.state;

    if (isDescriptionTextareaVisible && isClickedOutside) {
      this.setState({ isDescriptionTextareaVisible: false });
      this.handleDescriptionUpdate();
      return;
    }

    if (isNameInputVisible && name.trim().length >= 1 && isClickedOutside) {
      this.setState({ isNameInputVisible: false });
      this.handleNameUpdate();
    }
  };

  handleKeyPress = event => {
    const { isDescriptionTextareaVisible } = this.state;
    const { code } = event;

    if (code === 'Enter' || code === 'Escape') {
      const action = isDescriptionTextareaVisible
        ? this.handleDescriptionUpdate
        : this.handleNameUpdate;

      action();
    }
  };

  handleNameInputVisibility = () =>
    this.setState(({ isNameInputVisible }) => ({
      isNameInputVisible: !isNameInputVisible
    }));

  handleDescriptionTextareaVisibility = () =>
    this.setState(({ isDescriptionTextareaVisible }) => ({
      isDescriptionTextareaVisible: !isDescriptionTextareaVisible
    }));

  handleNameChange = event => {
    const {
      target: { value }
    } = event;

    this.setState({ name: value.trim() });
  };

  handleDescriptionChange = event => {
    const {
      target: { value }
    } = event;

    this.setState({ description: value });
  };

  handleNameUpdate = () => {
    const {
      updateCohort,
      details,
      match: {
        params: { id }
      }
    } = this.props;
    const { name } = this.state;
    const nameToUpdate = name.trim();
    const { name: previousName } = details;

    if (previousName === name) {
      this.setState({ isNameInputVisible: false });
      return;
    }

    if (nameToUpdate.length >= 1) {
      updateCohort(id, { name });
      this.setState({ isNameInputVisible: false });
    }
  };

  handleDescriptionUpdate = () => {
    const {
      updateCohort,
      details,
      match: {
        params: { id }
      }
    } = this.props;
    const { description } = this.state;
    const { description: previousDescription } = details;

    if (previousDescription.trim() === description.trim()) {
      this.setState({
        description: description.trim(),
        isDescriptionTextareaVisible: false
      });
      return;
    }

    if (whiteSpaceOnly(description)) {
      updateCohort(id, { description: '' });
      this.setState({ description: '' });
      return;
    }

    updateCohort(id, { description });
    this.setState({ isDescriptionTextareaVisible: false });
  };

  renderDescription = () => {
    const { description, isDescriptionTextareaVisible } = this.state;

    return (
      <Fragment>
        {isDescriptionTextareaVisible ? (
          <DescriptionTextarea
            description={description}
            handleDescriptionChange={this.handleDescriptionChange}
            handleClick={this.handleClick}
            handleKeyPress={this.handleKeyPress}
          />
        ) : (
          <Fragment>
            {description ? (
              <p
                className="cohort-header__description"
                data-id="description"
                onClick={this.handleDescriptionTextareaVisibility}
              >
                {description}
              </p>
            ) : (
              <button
                className="cohort-header__button link-button"
                onClick={this.handleDescriptionTextareaVisibility}
                type="button"
              >
                Add description
              </button>
            )}
          </Fragment>
        )}
      </Fragment>
    );
  };

  renderName = () => {
    const { name, isNameInputVisible } = this.state;

    return (
      <Fragment>
        {isNameInputVisible ? (
          <NameInput
            handleClick={this.handleClick}
            handleKeyPress={this.handleKeyPress}
            handleNameChange={this.handleNameChange}
            name={name}
          />
        ) : (
          <h1
            className="cohort-header__heading"
            onClick={this.handleNameInputVisibility}
          >
            {name}
          </h1>
        )}
      </Fragment>
    );
  };

  render() {
    return (
      <header className="cohort-header">
        <div className="cohort-header__top">
          <CohortIcon />
          {this.renderName()}
        </div>
        {this.renderDescription()}
      </header>
    );
  }
}

CohortHeader.propTypes = {
  details: PropTypes.objectOf(PropTypes.any).isRequired,
  match: RouterMatchPropType.isRequired,

  updateCohort: PropTypes.func.isRequired
};

export default withRouter(
  connect(
    null,
    {
      updateCohort
    }
  )(CohortHeader)
);
