/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { generateStyleProperties } from 'experience/styling';
import getProductRecs from '@salesforce/apex/DisplayProductRecords.getProductRecs';
import { SessionContextAdapter } from 'commerce/contextApi';
import { CartStatusAdapter } from 'commerce/cartApi';
import {
    createCartItemAddAction,
    createProductQuantityUpdateAction,
    createWishlistItemAddAction,
    dispatchAction,
} from 'commerce/actionApi';
import CommonModal from 'c/commonModal';
import {
    errorAccessInsufficient,
    errorDefault,
    errorLimitExceeded,
    errorLimitIncrement,
    errorLimitMaximum,
    errorLimitMinimum,
    modalCartActionContinue,
    modalCartActionView,
    modalCartTitleSuccess,
    toastTitleError,
    toastTitleSuccess,
    toastWishlistError,
    toastWishlistSuccess,
} from './labels';

const loginPage = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Login',
    },
};

const cartPage = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Current_Cart',
    },
};

const errorMessageToLabelMap = new Map([
    ['INSUFFICIENT_ACCESS', errorAccessInsufficient],
    ['MAX_LIMIT_EXCEEDED', errorLimitMaximum],
    ['LIMIT_EXCEEDED', errorLimitExceeded],
    ['MISSING_RECORD', errorLimitMinimum],
    ['INVALID_BATCH_SIZE', errorLimitIncrement],
]);

/**
 * @param {string} [errorCode] An error code to retrieve an error message for
 * @returns {string} An error message for the given _`errorCode`_ or a default error message in case no specific message exists
 */
function getErrorMessage(errorCode) {
    return errorMessageToLabelMap.get(errorCode) || errorDefault;
}

export default class BuilderProductPurchaseOptions extends LightningElement {
    static renderMode = 'light';

    @wire(NavigationContext)
    navContext;

    @wire(SessionContextAdapter)
    sessionContext;

    @wire(CartStatusAdapter)
    cartStatus;

    @api
    product;

    @api
    productInventory;

    @api
    productVariant;

    @api
    cartButtonText;

    @api
    cartButtonProcessingText;

    @api
    cartButtonColor;

    @api
    cartButtonColorHover;

    @api
    cartButtonColorBackground;

    @api
    cartButtonColorBackgroundHover;

    @api
    cartButtonColorBorder;

    @api
    cartButtonRadiusBorder;

    @api
    showWishlistButton = false;

    @api
    wishlistButtonText;

    @api
    wishlistButtonColor;

    @api
    wishlistButtonColorHover;

    @api
    wishlistButtonColorBackground;

    @api
    wishlistButtonColorBackgroundHover;

    @api
    wishlistButtonColorBorder;

    @api
    wishlistButtonRadiusBorder;

    @api
    minimumValueGuideText;

    @api
    maximumValueGuideText;

    @api
    stepValueGuideText;

    @api
    quantitySelectorLabel;

    @api
    outOfStockText;

    connectedCallback() {
        this.fetchProducts();
    }

    fetchProducts() {
        getProductRecs()
            .then((data) => {
                this.products = data;
                console.log(' this.products', this.product);
            })
            .catch((error) => {
                console.error('Error fetching products:', error);
            });
    }

   

 

    get quantityRule() {
        return this.product?.purchaseQuantityRule;
    }

    get normalizedMinimumText() {
        const text = this.minimumValueGuideText;
        const value = this.quantityRule?.minimum;
        return text && value ? text?.replace('{0}', Number(value)) : null;
    }

    get normalizedMaximumText() {
        const text = this.maximumValueGuideText;
        const value = this.quantityRule?.maximum;
        return text && value ? text?.replace('{0}', Number(value)) : null;
    }

    get normalizedIncrementText() {
        const text = this.stepValueGuideText;
        const value = this.quantityRule?.increment;
        return text && value ? text?.replace('{0}', Number(value)) : null;
    }

    get normalizedButtonText() {
        return this.isCartProcessing && this.cartButtonProcessingText
            ? this.cartButtonProcessingText
            : this.cartButtonText;
    }

    /**
     * Sets the custom CSS properties for the "Add To Cart" Button
     * @type {string}
     * @readonly
     * @private
     */
    get cartButtonStyles() {
        return generateStyleProperties({
            '--ref-c-common-button-primary-color': this.cartButtonColor || 'initial',
            '--ref-c-common-button-primary-color-background': this.cartButtonColorBackground || 'initial',
            '--ref-c-common-button-primary-color-background-hover': this.cartButtonColorBackgroundHover || 'initial',
            '--ref-c-common-button-primary-color-border': this.cartButtonColorBorder || 'initial',
            '--ref-c-common-button-primary-color-hover': this.cartButtonColorHover || 'initial',
            '--ref-c-common-button-radius-border': this.cartButtonRadiusBorder
                ? this.cartButtonRadiusBorder + 'px'
                : 'initial',
        });
    }


    handleQuantityChanged({ detail }) {
        const productId = this.product?.id;
        dispatchAction(this, createProductQuantityUpdateAction(productId, Number(detail.value)));
    }

    handleAddToCart({ detail }) {
        const productId = this.product?.id;
        productId &&
            dispatchAction(this, createCartItemAddAction(productId, detail.quantity), {
                onSuccess: () => {
                    CommonModal.open({
                        label: modalCartTitleSuccess,
                        size: 'small',
                        secondaryActionLabel: modalCartActionContinue,
                        primaryActionLabel: modalCartActionView,
                        onprimaryactionclick: () => navigate(this.navContext, cartPage),
                    });
                },
                onError: (error) => {
                    const err = error?.error ?? error;
                    if (err?.code === 'GUEST_INSUFFICIENT_ACCESS') {
                        navigate(this.navContext, loginPage);
                    } else {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: toastTitleError,
                                message: getErrorMessage(err?.code),
                                variant: 'error',
                                mode: 'sticky',
                            })
                        );
                    }
                },
            });
    }

   
}