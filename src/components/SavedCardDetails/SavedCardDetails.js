import React, { useState } from 'react';
import { func, object, string } from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from 'react-intl';
import { Button, InlineTextButton, IconClose, Modal } from '../../components';
import css from './SavedCardDetails.css';

const SavedCardDetails = props => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    rootClassName,
    className,
    intl,
    card,
    onDeleteCard,
    onManageDisableScrolling,
    children,
    inProgress: deleteInProgress,
  } = props;

  const { last4Digits, expirationMonth, expirationYear } = card || {};
  const classes = classNames(rootClassName || css.root, className);

  const paymentMethodPlaceholder = intl.formatMessage(
    { id: 'SavedCardDetails.savedPaymentMethodPlaceholder' },
    { lastFour: last4Digits }
  );

  const savedPaymentMethodTitle = intl.formatMessage({
    id: 'SavedCardDetails.savedPaymentMethodTitle',
  });
  const deletePaymentMethod = intl.formatMessage({ id: 'SavedCardDetails.deletePaymentMethod' });

  const handleDeleteCard = () => {
    setIsOpen(true);
  };

  const isExpired = () => {
    const currentTime = new Date();
    if (expirationYear < currentTime.getFullYear()) {
      return true;
    } else if (
      expirationYear === currentTime.getFullYear() &&
      expirationMonth < currentTime.getMonth()
    ) {
      return true;
    }

    return false;
  };

  const isCardExpired = expirationMonth && expirationYear && isExpired(card);

  const cardDetails = (
    <React.Fragment>
      <span className={css.savedPaymentMethodTitle}>{savedPaymentMethodTitle}</span>
      <p>
        {paymentMethodPlaceholder}
        <span className={css.expirationDate}>
          {expirationMonth}/{expirationYear}
        </span>
      </p>
    </React.Fragment>
  );

  return (
    <div className={classes}>
      {isCardExpired ? (
        <div className={css.savedPaymentMethodExpired}>
          {cardDetails}
          <p className={css.cardExpiredText}>This card has expired</p>
        </div>
      ) : (
        <div className={css.savedPaymentMethod}>{cardDetails}</div>
      )}

      {onDeleteCard ? (
        <InlineTextButton onClick={handleDeleteCard} className={css.savedPaymentMethodDelete}>
          <IconClose rootClassName={css.closeIcon} size="small" />
          {deletePaymentMethod}
        </InlineTextButton>
      ) : null}
      {children}

      <Modal
        id="VerifyDeletingPaymentMethod"
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        contentClassName={css.modalContent}
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <div>
          <div className={css.modalTitle}>Are you sure you want to remove this credit card?</div>
          <p className={css.modalMessage}>
            The card will be removed from your account and can't be used for future purchases.
          </p>
          <div className={css.modalButtonsWrapper}>
            <div onClick={() => setIsOpen(false)} className={css.cancelCardDelete}>
              Cancel
            </div>

            <Button onClick={onDeleteCard} inProgress={deleteInProgress}>
              Remove credit card
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

SavedCardDetails.defaultProps = {
  rootClassName: null,
  className: null,
  card: null,
  onUpdateCard: null,
  onDeleteCard: null,
  onManageDisableScrolling: () => null,
};

SavedCardDetails.propTypes = {
  rootClassName: string,
  className: string,
  intl: intlShape.isRequired,
  card: object,
  onUpdateCard: func,
  onDeleteCard: func,
  onManageDisableScrolling: func,
};

export default injectIntl(SavedCardDetails);
