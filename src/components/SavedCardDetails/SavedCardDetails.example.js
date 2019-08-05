import { fakeIntl } from '../../util/test-data';
import SavedCardDetails from './SavedCardDetails';

const noop = () => null;
const defaultProps = {
  card: {
    brand: 'visa',
    expirationMonth: 10,
    expirationYear: 2020,
    last4Digits: '3220',
  },
};

export const SavedCardDetailsExample = {
  component: SavedCardDetails,
  props: {
    ...defaultProps,
    intl: fakeIntl,
    onUpdateCard: noop,
    onDeleteCard: noop,
    onManageDisableScrolling: noop,
  },
  group: 'misc',
};

export const SavedCardDetailsWithoutDelete = {
  component: SavedCardDetails,
  props: {
    ...defaultProps,
    intl: fakeIntl,
    onUpdateCard: noop,
    onDeleteCard: null,
    onManageDisableScrolling: noop,
  },
  group: 'misc',
};

export const SavedCardDetailsExpired = {
  component: SavedCardDetails,
  props: {
    card: {
      brand: 'visa',
      expirationMonth: 10,
      expirationYear: 2016,
      last4Digits: '3220',
    },
    intl: fakeIntl,
    onUpdateCard: noop,
    onDeleteCard: null,
    onManageDisableScrolling: noop,
  },
  group: 'misc',
};
