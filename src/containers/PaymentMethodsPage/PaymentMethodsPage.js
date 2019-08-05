import React from 'react';
import { bool, func, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { ensureCurrentUser, ensureStripeCustomer, ensurePaymentMethodCard } from '../../util/data';
import { propTypes } from '../../util/types';
import {
  createStripeCustomer,
  addPaymentMethod,
  deletePaymentMethod,
  updatePaymentMethod,
} from '../../ducks/paymentMethods.duck';
import { handleCardSetup } from '../../ducks/stripe.duck';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
  SavedCardDetails,
  LayoutSideNavigation,
  LayoutWrapperMain,
  LayoutWrapperSideNav,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  Footer,
  Page,
  UserNav,
} from '../../components';
import { TopbarContainer } from '..';
import { PaymentMethodsForm } from '../../forms';
import { createStripeSetupIntent, stripeCustomer, loadData } from './PaymentMethodsPage.duck.js';

import css from './PaymentMethodsPage.css';

const PaymentMethodsPageComponent = props => {
  const {
    currentUser,
    addPaymentMethodError,
    deletePaymentMethodError,
    createStripeCustomerError,
    handleCardSetupError,
    onCreateSetupIntent,
    onHandleCardSetup,
    onCreateStripeCustomer,
    onAddPaymentMethod,
    onUpdatePaymentMethod,
    onDeletePaymentMethod,
    fetchStripeCustomer,
    scrollingDisabled,
    onManageDisableScrolling,
    intl,
  } = props;

  const handleSubmit = params => {
    const ensuredCurrentUser = ensureCurrentUser(currentUser);
    const stripeCustomer = ensuredCurrentUser.stripeCustomer;
    const hasSavedPaymentMethod = stripeCustomer ? stripeCustomer.defaultPaymentMethod : null;

    const { stripe, card, formValues } = params;

    onCreateSetupIntent().then(setupIntent => {
      const setupIntentClientSecret =
        setupIntent && setupIntent.attributes ? setupIntent.attributes.clientSecret : null;
      const { name, addressLine1, addressLine2, postal, state, city, country } = formValues;
      const addressMaybe =
        addressLine1 && postal
          ? {
              address: {
                city: city,
                country: country,
                line1: addressLine1,
                line2: addressLine2,
                postal_code: postal,
                state: state,
              },
            }
          : {};
      const billingDetails = {
        name,
        email: ensureCurrentUser(currentUser).attributes.email,
        ...addressMaybe,
      };

      const paymentParams = {
        payment_method_data: {
          billing_details: billingDetails,
        },
      };

      const stripeParams = { stripe, card, setupIntentClientSecret, paymentParams };

      onHandleCardSetup(stripeParams)
        .then(result => {
          console.log('Result', result);

          const setupIntent = result ? result.setupIntent : null;
          const paymentMethodId = setupIntent ? setupIntent.payment_method : null;

          if (result.error) {
            return;
          }
          if (!stripeCustomer) {
            return onCreateStripeCustomer(paymentMethodId);
          } else if (!hasSavedPaymentMethod) {
            return onAddPaymentMethod(paymentMethodId);
          } else {
            return onUpdatePaymentMethod(paymentMethodId);
          }
        })
        .then(result => {
          fetchStripeCustomer();
        });
    });
  };

  const handleRemovePaymentMethod = () => {
    onDeletePaymentMethod().then(() => {
      fetchStripeCustomer();
    });
  };

  const tabs = [
    {
      text: <FormattedMessage id="PaymentMethodsPage.contactDetailsTabTitle" />,
      selected: false,
      linkProps: {
        name: 'ContactDetailsPage',
      },
    },
    {
      text: <FormattedMessage id="PaymentMethodsPage.passwordTabTitle" />,
      selected: false,
      linkProps: {
        name: 'PasswordChangePage',
      },
    },
    {
      text: <FormattedMessage id="PaymentMethodsPage.paymentsTabTitle" />,
      selected: false,
      linkProps: {
        name: 'PayoutPreferencesPage',
      },
    },
    {
      text: <FormattedMessage id="PaymentMethodsPage.paymentMethodsTabTitle" />,
      selected: true,
      linkProps: {
        name: 'PaymentMethodsPage',
      },
    },
  ];

  const title = intl.formatMessage({ id: 'PaymentMethodsPage.title' });

  const ensuredCurrentUser = ensureCurrentUser(currentUser);
  const currentUserLoaded = !!ensuredCurrentUser.id;

  // Get first and last name of the current user and use it in the StripePaymentForm to autofill the name field
  const userName = currentUserLoaded
    ? `${ensuredCurrentUser.attributes.profile.firstName} ${
        ensuredCurrentUser.attributes.profile.lastName
      }`
    : null;

  const initalValuesForStripePayment = { name: userName, country: 'FI' };

  const hasDefaultPaymentMethod =
    currentUser &&
    ensureStripeCustomer(currentUser.stripeCustomer).attributes.stripeCustomerId &&
    ensurePaymentMethodCard(currentUser.stripeCustomer.defaultPaymentMethod).id;

  const card = hasDefaultPaymentMethod
    ? ensurePaymentMethodCard(currentUser.stripeCustomer.defaultPaymentMethod).attributes.card
    : null;

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation>
        <LayoutWrapperTopbar>
          <TopbarContainer
            currentPage="PaymentMethodsPage"
            desktopClassName={css.desktopTopbar}
            mobileClassName={css.mobileTopbar}
          />
          <UserNav selectedPageName="PaymentMethodsPage" />
        </LayoutWrapperTopbar>
        <LayoutWrapperSideNav tabs={tabs} />
        <LayoutWrapperMain>
          <div className={css.content}>
            <h1 className={css.title}>
              <FormattedMessage id="PaymentMethodsPage.heading" />
            </h1>
            {hasDefaultPaymentMethod ? (
              <SavedCardDetails
                intl={intl}
                card={card}
                //onUpdateCard={/*some func*/}
                onDeleteCard={handleRemovePaymentMethod}
                onManageDisableScrolling={onManageDisableScrolling}
              />
            ) : (
              <PaymentMethodsForm
                className={css.paymentForm}
                formId="PaymentMethodsForm"
                initialValues={initalValuesForStripePayment}
                onSubmit={handleSubmit}
                handleRemovePaymentMethod={handleRemovePaymentMethod}
                hasDefaultPaymentMethod={hasDefaultPaymentMethod}
                addPaymentMethodError={addPaymentMethodError}
                deletePaymentMethodError={deletePaymentMethodError}
                createStripeCustomerError={createStripeCustomerError}
                handleCardSetupError={handleCardSetupError}
              />
            )}
          </div>
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSideNavigation>
    </Page>
  );
};

PaymentMethodsPageComponent.defaultProps = {
  currentUser: null,
  addPaymentMethodError: null,
  deletePaymentMethodError: null,
  createStripeCustomerError: null,
  handleCardSetupError: null,
};

PaymentMethodsPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  scrollingDisabled: bool.isRequired,
  addPaymentMethodError: object,
  deletePaymentMethodError: object,
  createStripeCustomerError: object,
  handleCardSetupError: object,
  onCreateSetupIntent: func.isRequired,
  onHandleCardSetup: func.isRequired,
  onCreateStripeCustomer: func.isRequired,
  onAddPaymentMethod: func.isRequired,
  onUpdatePaymentMethod: func.isRequired,
  onDeletePaymentMethod: func.isRequired,
  fetchStripeCustomer: func.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;

  const {
    addPaymentMethodError,
    deletePaymentMethodError,
    createStripeCustomerError,
  } = state.paymentMethods;

  const { handleCardSetupError } = state.stripe;
  return {
    currentUser,
    scrollingDisabled: isScrollingDisabled(state),
    addPaymentMethodError,
    deletePaymentMethodError,
    createStripeCustomerError,
    handleCardSetupError,
  };
};

const mapDispatchToProps = dispatch => ({
  fetchStripeCustomer: () => dispatch(stripeCustomer()),
  onHandleCardSetup: params => dispatch(handleCardSetup(params)),
  onCreateSetupIntent: params => dispatch(createStripeSetupIntent(params)),
  onCreateStripeCustomer: params => dispatch(createStripeCustomer(params)),
  onAddPaymentMethod: params => dispatch(addPaymentMethod(params)),
  onDeletePaymentMethod: params => dispatch(deletePaymentMethod(params)),
  onUpdatePaymentMethod: params => dispatch(updatePaymentMethod(params)),
});

const PaymentMethodsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(PaymentMethodsPageComponent);

PaymentMethodsPage.loadData = loadData;

export default PaymentMethodsPage;
