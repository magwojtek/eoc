import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _isEmpty from 'lodash/isEmpty';
import _trim from 'lodash/trim';
import classNames from 'classnames';
import { FormattedMessage, injectIntl } from 'react-intl';
import _flowRight from 'lodash/flowRight';
import isEmpty from 'validator/lib/isEmpty';
import isLength from 'validator/lib/isLength';

import { ListIcon } from 'assets/images/icons';
import {
  changeType,
  lockListHeader,
  unlockListHeader,
  updateList
} from 'modules/list/model/actions';
import {
  RouterMatchPropType,
  IntlPropType,
  UserPropType
} from 'common/constants/propTypes';
import NameInput from 'common/components/NameInput';
import DescriptionTextarea from 'common/components/DescriptionTextarea';
import { ListType } from '../consts';
import Preloader, { PreloaderSize } from 'common/components/Preloader';
import { DefaultLocks, KeyCodes } from 'common/constants/enums';
import Dialog from 'common/components/Dialog';
import { getCurrentUser } from 'modules/user/model/selectors';
import { validateWith } from 'common/utils/helpers';
import ErrorMessage from 'common/components/Forms/ErrorMessage';
import './ListHeader.scss';
import {
  attachBeforeUnloadEvent,
  removeBeforeUnloadEvent
} from 'common/utils/events';

class ListHeader extends PureComponent {
  constructor(props) {
    super(props);

    const {
      details: { description, name, type }
    } = this.props;
    const trimmedDescription = description.trim();

    this.state = {
      descriptionInputValue: trimmedDescription,
      errorMessageId: '',
      isDescriptionTextareaVisible: false,
      isDialogVisible: false,
      isNameInputVisible: false,
      listType: type,
      nameInputValue: name,
      pendingForDescription: false,
      pendingForName: false,
      pendingForTypeUpdate: false,
      updatedType: null
    };
  }

  componentDidMount() {
    attachBeforeUnloadEvent(this.handleWindowBeforeUnload);
  }

  componentDidUpdate(previousProps) {
    const {
      details: { name, description, type }
    } = this.props;
    const {
      details: {
        name: previousName,
        description: previousDescription,
        type: previousType
      }
    } = previousProps;
    const { descriptionInputValue, nameInputValue } = this.state;
    const dataHasChanged =
      previousName !== nameInputValue ||
      previousDescription !== descriptionInputValue;

    if (name !== previousName) {
      this.updateName();
    }

    if (description !== previousDescription) {
      this.updateDescription();
    }

    if (type !== previousType) {
      this.updateType();
    }

    this.handleDataChange(dataHasChanged);
  }

  componentWillUnmount() {
    removeBeforeUnloadEvent(this.handleWindowBeforeUnload);
  }

  handleWindowBeforeUnload = event => {
    const { isDirty } = this.state;

    if (isDirty) {
      event.preventDefault();
      // Chrome requires returnValue to be set
      // eslint-disable-next-line no-param-reassign
      event.returnValue = '';
    }
  };

  handleDataChange = dataHasChanged =>
    this.setState({ isDirty: dataHasChanged });

  updateName = () => {
    const {
      details: { name }
    } = this.props;

    this.setState({
      nameInputValue: name
    });
  };

  updateDescription = () => {
    const {
      details: { description }
    } = this.props;

    this.setState({
      descriptionInputValue: description
    });
  };

  updateType = () => {
    const {
      details: { type }
    } = this.props;

    this.setState({
      listType: type
    });
  };

  showNameInput = () =>
    this.setState({
      isNameInputVisible: true
    });

  showDescriptionTextarea = () =>
    this.setState({
      isDescriptionTextareaVisible: true
    });

  handleNameChange = event => {
    const {
      target: { value }
    } = event;

    this.setState({ nameInputValue: value }, this.validateName);
  };

  handleDescriptionChange = event => {
    const {
      target: { value }
    } = event;

    this.setState({ descriptionInputValue: value });
  };

  handleKeyPress = event => {
    const {
      errorMessageId,
      isDescriptionTextareaVisible,
      isNameInputVisible
    } = this.state;
    const { code } = event;

    if (code === KeyCodes.ESCAPE) {
      if (isDescriptionTextareaVisible) {
        this.handleDescriptionUpdate();
      }

      if (isNameInputVisible && !errorMessageId) {
        this.handleNameUpdate();
      }
    }

    if (code === KeyCodes.ENTER && !errorMessageId) {
      this.handleNameUpdate();
    }
  };

  validateName = () => {
    const { nameInputValue } = this.state;
    let errorMessageId;

    errorMessageId = validateWith(
      value => !isEmpty(value, { ignore_whitespace: true })
    )('common.form.required-warning')(nameInputValue);

    if (_trim(nameInputValue)) {
      errorMessageId = validateWith(value =>
        isLength(value, { min: 1, max: 32 })
      )('common.form.field-min-max')(nameInputValue);
    }

    this.setState({ errorMessageId });
  };

  handleClick = (event, isClickedOutside) => {
    const {
      errorMessageId,
      isDescriptionTextareaVisible,
      isNameInputVisible
    } = this.state;

    if (isDescriptionTextareaVisible && isClickedOutside) {
      this.handleDescriptionUpdate();

      return;
    }

    if (isNameInputVisible && isClickedOutside && !errorMessageId) {
      this.handleNameUpdate();
    }
  };

  handleNameUpdate = () => {
    const {
      details,
      match: {
        params: { id }
      },
      updateBreadcrumbs,
      updateList
    } = this.props;
    const { errorMessageId, nameInputValue } = this.state;
    const nameToUpdate = _trim(nameInputValue);
    const { name: previousName } = details;

    if (!errorMessageId && _trim(previousName) === nameToUpdate) {
      this.setState({ isNameInputVisible: false });

      return;
    }

    if (!errorMessageId && nameToUpdate.length >= 1) {
      this.setState({ pendingForName: true });

      updateList(id, { name: nameToUpdate }, previousName).finally(() => {
        this.setState({
          isNameInputVisible: false,
          nameInputValue: nameToUpdate,
          pendingForName: false
        });

        updateBreadcrumbs();
      });
    }
  };

  handleDescriptionUpdate = () => {
    const {
      details,
      match: {
        params: { id }
      },
      updateList
    } = this.props;
    const { descriptionInputValue } = this.state;
    const descriptionToUpdate = _trim(descriptionInputValue);
    const { description: previousDescription, name } = details;

    if (_trim(previousDescription) === descriptionToUpdate) {
      this.setState({ isDescriptionTextareaVisible: false });

      return;
    }

    const updatedDescription = _isEmpty(descriptionToUpdate)
      ? ''
      : descriptionToUpdate;

    this.setState({ pendingForDescription: true });

    updateList(id, { description: updatedDescription }, name).finally(() =>
      this.setState({
        isDescriptionTextareaVisible: false,
        descriptionInputValue: updatedDescription,
        pendingForDescription: false
      })
    );
  };

  handleChangingType = () => {
    const {
      changeType,
      details: { name },
      match: {
        params: { id: listId }
      }
    } = this.props;
    const { updatedType } = this.state;

    this.setState({ pendingForTypeUpdate: true });

    changeType(listId, name, updatedType).finally(() => {
      this.setState({ pendingForTypeUpdate: false, listType: updatedType });
      this.hideDialog();
    });
  };

  showDialog = event => {
    const { value } = event.target;

    this.setState({ isDialogVisible: true, updatedType: value });
  };

  hideDialog = () =>
    this.setState({ isDialogVisible: false, updatedType: null });

  handleNameLock = () => {
    const {
      currentUser: { id: userId },
      match: {
        params: { id: listId }
      }
    } = this.props;

    lockListHeader(listId, userId, { nameLock: true });
  };

  handleNameUnmount = () => {
    const {
      currentUser: { id: userId },
      match: {
        params: { id: listId }
      }
    } = this.props;

    unlockListHeader(listId, userId, { nameLock: false });
  };

  handleDescriptionLock = () => {
    const {
      currentUser: { id: userId },
      match: {
        params: { id: listId }
      }
    } = this.props;

    lockListHeader(listId, userId, { descriptionLock: true });
  };

  handleDescriptionUnmount = () => {
    const {
      currentUser: { id: userId },
      match: {
        params: { id: listId }
      }
    } = this.props;

    unlockListHeader(listId, userId, { descriptionLock: false });
  };

  renderDescription = () => {
    const {
      descriptionInputValue,
      isDescriptionTextareaVisible,
      pendingForDescription
    } = this.state;
    const {
      details: {
        description,
        isOwner,
        locks: { description: descriptionLock } = DefaultLocks
      }
    } = this.props;

    if (!description && !isOwner) {
      return;
    }

    return isDescriptionTextareaVisible ? (
      <DescriptionTextarea
        description={descriptionInputValue}
        disabled={pendingForDescription || descriptionLock}
        onClick={this.handleClick}
        onDescriptionChange={this.handleDescriptionChange}
        onFocus={this.handleDescriptionLock}
        onKeyPress={this.handleKeyPress}
        onUnmount={this.handleDescriptionUnmount}
      />
    ) : (
      <>
        {description && (
          <p
            className={classNames('list-header__description', {
              'list-header--clickable': !descriptionLock && isOwner,
              'list-header__description--disabled': descriptionLock
            })}
            data-id="description"
            onClick={
              isOwner && !descriptionLock ? this.showDescriptionTextarea : null
            }
          >
            {description}
          </p>
        )}
        {isOwner && !description && (
          <button
            className="list-header__button link-button"
            disabled={descriptionLock}
            onClick={descriptionLock ? null : this.showDescriptionTextarea}
            type="button"
          >
            <FormattedMessage id="list.list-description.add-button" />
          </button>
        )}
      </>
    );
  };

  renderName = () => {
    const {
      errorMessageId,
      isNameInputVisible,
      nameInputValue,
      pendingForName
    } = this.state;
    const {
      details: { isOwner, locks: { name: nameLock } = DefaultLocks, name },
      intl: { formatMessage }
    } = this.props;

    return (
      <div
        className={classNames('list-header__name', {
          'list-header__name--disabled': nameLock
        })}
      >
        <ListIcon />
        {isNameInputVisible && !nameLock ? (
          <div className="list-header__name-input">
            <NameInput
              disabled={pendingForName || nameLock}
              name={nameInputValue}
              onClick={isOwner ? this.handleClick : null}
              onFocus={this.handleNameLock}
              onKeyPress={this.handleKeyPress}
              onNameChange={this.handleNameChange}
              onUnmount={this.handleNameUnmount}
            />
            {errorMessageId && (
              <ErrorMessage message={formatMessage({ id: errorMessageId })} />
            )}
          </div>
        ) : (
          <h1
            className={classNames('list-header__heading', {
              'list-header--clickable': !nameLock && isOwner,
              'list-header__heading--disabled': nameLock
            })}
            onClick={isOwner && !nameLock ? this.showNameInput : null}
          >
            {name}
          </h1>
        )}
      </div>
    );
  };

  renderListType = () => {
    const {
      intl: { formatMessage }
    } = this.props;
    const { listType, pendingForTypeUpdate } = this.state;

    return (
      <select
        className="list-header__select primary-select"
        disabled={pendingForTypeUpdate}
        onChange={this.showDialog}
        value={listType}
      >
        <option className="list-header__option" value={ListType.LIMITED}>
          {formatMessage({ id: 'list.type.limited' })}
        </option>
        <option className="list-header__option" value={ListType.SHARED}>
          {formatMessage({ id: 'list.type.shared' })}
        </option>
      </select>
    );
  };

  renderDialog = () => {
    const {
      isDialogVisible,
      pendingForTypeUpdate,
      updatedType: value
    } = this.state;
    const {
      details: { name },
      intl: { formatMessage }
    } = this.props;

    return (
      <Dialog
        cancelLabel={formatMessage({ id: 'common.button.cancel' })}
        confirmLabel={formatMessage({ id: 'common.button.confirm' })}
        isVisible={isDialogVisible}
        onCancel={this.hideDialog}
        onConfirm={this.handleChangingType}
        pending={pendingForTypeUpdate}
        title={formatMessage(
          {
            id: pendingForTypeUpdate
              ? 'list.index.changing-type'
              : 'list.index.change-type-question'
          },
          { name, value }
        )}
      />
    );
  };

  render() {
    const {
      details: { isOwner, type },
      isCohortList
    } = this.props;
    const {
      pendingForDescription,
      pendingForName,
      pendingForTypeUpdate
    } = this.state;

    return (
      <div className="list-header">
        <div className="list-header__top">
          {this.renderName()}
          {pendingForName && <Preloader size={PreloaderSize.SMALL} />}
          {isCohortList && (
            <div className="list-header__type">
              {isOwner ? (
                <>
                  {this.renderListType()}
                  {pendingForTypeUpdate && (
                    <Preloader size={PreloaderSize.SMALL} />
                  )}
                </>
              ) : (
                type
              )}
            </div>
          )}
        </div>
        <div className="list-header__bottom">
          {this.renderDescription()}
          {pendingForDescription && <Preloader size={PreloaderSize.SMALL} />}
        </div>
        {this.renderDialog()}
      </div>
    );
  }
}

ListHeader.propTypes = {
  currentUser: UserPropType.isRequired,
  details: PropTypes.objectOf(PropTypes.any).isRequired,
  intl: IntlPropType.isRequired,
  isCohortList: PropTypes.bool,
  match: RouterMatchPropType.isRequired,

  changeType: PropTypes.func.isRequired,
  updateBreadcrumbs: PropTypes.func.isRequired,
  updateList: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  currentUser: getCurrentUser(state)
});

export default _flowRight(
  injectIntl,
  withRouter,
  connect(mapStateToProps, { changeType, updateList })
)(ListHeader);
