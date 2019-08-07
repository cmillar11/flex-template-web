import { fakeIntl } from '../../util/test-data';
import SavedCardDetails from './SavedCardDetails';

const noop = () => null;
const defaultProps = {
  intl: fakeIntl,
  onDeleteCard: noop,
  onChange: noop,
  onManageDisableScrolling: noop,
};

export const SavedCardDetailsExample = {
  component: SavedCardDetails,
  props: {
    ...defaultProps,
    card: {
      brand: 'visa',
      expirationMonth: 10,
      expirationYear: 2050,
      last4Digits: '3220',
    },
  },
  group: 'misc',
};

export const SavedCardDetailsNoDelete = {
  component: SavedCardDetails,
  props: {
    ...defaultProps,
    card: {
      brand: 'mastercard',
      expirationMonth: 10,
      expirationYear: 2050,
      last4Digits: '3220',
    },
    onDeleteCard: null,
  },
  group: 'misc',
};

export const SavedCardDetailsExpired = {
  component: SavedCardDetails,
  props: {
    ...defaultProps,
    card: {
      brand: 'amex',
      expirationMonth: 10,
      expirationYear: 2016,
      last4Digits: '3220',
    },
  },
  group: 'misc',
};
