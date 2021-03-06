export const MessageType = Object.freeze({
  ERROR: 'error',
  ERROR_NO_RETRY: 'no_retry',
  INFO: 'info',
  SUCCESS: 'success'
});

export const SortOrderType = Object.freeze({
  ASCENDING: 'ascending',
  DESCENDING: 'descending'
});

export const StatusType = Object.freeze({
  PENDING: 'pending',
  RESOLVED: 'resolved',
  ERROR: 'error'
});

export const Routes = Object.freeze({
  ACCOUNT_CREATED: 'account-created',
  ACCOUNT_DELETED: 'account-deleted',
  COHORT: 'cohort',
  COHORTS: 'cohorts',
  CONFIRMATION_LINK_EXPIRED: 'confirmation-link-expired',
  DASHBOARD: 'dashboard',
  LIST: 'sack',
  PASSWORD_RECOVERY_EXPIRED: 'recovery-link-expired',
  PASSWORD_RECOVERY_SUCCESS: 'password-recovery-success'
});

export const UserRoles = Object.freeze({
  MEMBER: 'userRoles/MEMBER',
  OWNER: 'userRoles/OWNER',
  VIEWER: 'userRoles/VIEWER'
});

export const UserRolesToDisplay = Object.freeze({
  MEMBER: 'member',
  OWNER: 'owner',
  VIEWER: 'viewer'
});

export const ColorType = {
  BROWN: 'element/BROWN',
  GRAY: 'element/GRAY',
  ORANGE: 'element/ORANGE'
};

export const ViewType = {
  LIST: 'viewType/LIST',
  TILES: 'viewType/TILES'
};

export const KeyCodes = Object.freeze({
  ENTER: 'Enter',
  ESCAPE: 'Escape'
});

export const NodeTypes = Object.freeze({
  LINK: 'A'
});

export const DefaultLocks = Object.freeze({ name: true, description: true });

export const PasswordValidationValues = Object.freeze({
  MIN: 4,
  MAX: 32
});

export const EmailReportsFrequency = Object.freeze({
  FRIDAY: 'report/FRIDAY',
  MONDAY: 'report/MONDAY',
  NEVER: 'report/NEVER',
  SATURDAY: 'report/SATURDAY',
  SUNDAY: 'report/SUNDAY',
  THURSDAY: 'report/THURSDAY',
  TUESDAY: 'report/TUESDAY',
  WEDNESDAY: 'report/WEDNESDAY',
  WEEKLY: 'reports/WEEKLY'
});

export const RouteParams = Object.freeze({
  AGREEMENT_REQUIRED: 'agreement-required',
  ERROR: 'error'
});
