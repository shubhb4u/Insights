import { LightningElement, api, track, wire } from 'lwc';
import { isCmsResource, resolve } from 'experience/resourceResolver';
import { generateUrl, navigate, NavigationContext } from 'lightning/navigation';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { createImageDataMap } from 'experience/picture';
import { calculateImageSizes, imageSizesDefined } from 'c/productGalleryUtils';
import { CartStatusAdapter } from 'commerce/cartApi';
import { EVENT, PRODUCT_CLASS, QUANTITY_RULES } from './constants';
import { i18n } from './labels';

export default class SearchProductCard extends LightningElement {
    static renderMode = 'light';
    
    @track _imageSizes = { mobile: 0, tablet: 0, desktop: 0 };
    _displayData = {};
    _navigationContext;
    _productUrl;

    @wire(NavigationContext)
    wiredNavigationContext(context) {
        this._navigationContext = context;
        this.updateCallToActionButtonUrl();
    }
    @wire(SessionContextAdapter) sessionContext;
    @wire(AppContextAdapter) appContext;
    @wire(CartStatusAdapter) cartStatus;

    @api
    set displayData(data) {
        this._displayData = data || {};
        this.updateCallToActionButtonUrl();
    }
    get displayData() {
        return this._displayData;
    }

    @api configuration;

    @api focus() {
        if (this.configuration?.showCallToActionButton) {
            const focusTarget = this.querySelector('c-common-link') || this.querySelector('c-common-button');
            focusTarget?.focus();
        } else {
            const index = this.fields?.findIndex((field) => field.displayData.tabStoppable) || 0;
            const focusTarget = Array.from(this.querySelectorAll('c-search-product-field'))[index];
            focusTarget?.focus();
        }
    }

    get pricingInfo() {
        const prices = this.displayData?.prices || {};
        return {
            negotiatedPrice: prices?.negotiatedPrice || '',
            listingPrice: prices?.listingPrice || '',
            currencyIsoCode: prices?.currencyIsoCode || '',
            isLoading: !!prices.isLoading,
        };
    }

    get addToCartButtonAriaLabel() {
        if (this.displayData?.name) {
            return i18n.addToCartAriaLabel.replace('{productTitle}', this.displayData.name);
        }
        return '';
    }

    get viewOptionsButtonAriaLabel() {
        if (this.displayData?.name) {
            return i18n.viewOptionsAriaLabel.replace('{productTitle}', this.displayData.name);
        }
        return '';
    }

    get fields() {
        return (this.displayData?.fields ?? []).map((field) => {
            return {
                displayData: field,
                configuration: this.configuration?.fieldConfiguration[field.name] || {},
            };
        });
    }

    get image() {
        calculateImageSizes(this.querySelector('.imageArea'), this._imageSizes);
        const img = this.displayData?.image || {};
        return {
            alternateText: img?.alternateText || '',
            url: resolve(img?.url ?? '', false, { height: 460, width: 460 }),
            images:
                img?.url && isCmsResource(img?.url) && imageSizesDefined(this._imageSizes)
                    ? createImageDataMap(img.url, this._imageSizes, [1, 2])
                    : [],
        };
    }

    get cardContainerClass() {
        return this.isGridLayout ? 'cardContainerGrid' : 'cardContainerList';
    }

    get isGridLayout() {
        return this.configuration?.layout === 'grid';
    }

    get actionButtonVariant() {
        const section = this?.querySelector('section');
        const variant = section && getComputedStyle(section).getPropertyValue('--ref-c-search-product-card-button-variant');
        return ['primary', 'secondary', 'tertiary'].includes(variant) ? variant : 'primary';
    }

    get minimumText() {
        const min = Number.parseInt(this.quantityRules?.minimum ?? '', 10);
        return this.configuration?.minimumQuantityGuideText.replace('{0}', `${min}`);
    }

    get maximumText() {
        const max = Number.parseInt(this.quantityRules?.maximum ?? '', 10);
        return this.configuration?.maximumQuantityGuideText.replace('{0}', `${max}`);
    }

    get incrementText() {
        const increment = Number.parseInt(this.quantityRules?.increment ?? '', 10);
        return this.configuration?.incrementQuantityGuideText.replace('{0}', `${increment}`);
    }

    isQuantityValid = true;

    get addToCartButtonDisabled() {
        return this.isCartProcessing || this.configuration?.addToCartDisabled || !this.isQuantityValid;
    }

    get addToCartButtonText() {
        return this.isCartProcessing && this.configuration?.addToCartButtonProcessingText
            ? this.configuration?.addToCartButtonProcessingText
            : this.configuration?.addToCartButtonText;
    }

    handleValueChanged(evt) {
        this.isQuantityValid = evt.detail.isValid;
    }

    get quantityRules() {
        if (!this.displayData?.purchaseQuantityRule && this.configuration?.showQuantitySelector) {
            return {
                minimum: QUANTITY_RULES.DEFAULT_MIN,
                maximum: QUANTITY_RULES.DEFAULT_MAX,
                increment: QUANTITY_RULES.DEFAULT_INCREMENT,
            };
        }
        return this.displayData?.purchaseQuantityRule || {};
    }

    get quantityRuleMinimum() {
        return Number.parseInt(this.quantityRules?.minimum || '1', 10);
    }

    get quantityRuleMaximum() {
        return Number.parseInt(this.quantityRules?.maximum || '1000000', 10);
    }

    get quantityRuleIncrement() {
        return Number.parseInt(this.quantityRules?.increment || '1', 10);
    }

    get quantityRuleCombinedText() {
        const min = this.quantityRuleMinimum;
        const max = this.quantityRuleMaximum;
        return this.configuration?.minimumMaximumQuantityGuideText
            .replace('{0}', `${min}`)
            .replace('{1}', `${max}`);
    }

    get showInlineQuantitySelector() {
        return (
            this.configuration?.showInlineQuantitySelector &&
            (this.quantityRuleMinimum > 1 || this.quantityRuleIncrement > 1)
        );
    }

    get showInlineQuantitySelectorText() {
        return (
            this.configuration?.showInlineQuantitySelector &&
            !this.showInlineQuantitySelector &&
            (this.quantityRuleMinimum > 1 || this.quantityRuleMaximum > 1)
        );
    }

    get showPrice() {
        return this.displayData?.prices && this.configuration?.showPrice;
    }

    get showProductImage() {
        return this.displayData?.image && this.configuration?.showProductImage;
    }

    get showCallToActionButton() {
        return this.configuration?.showCallToActionButton;
    }

    get isCTAButtonAddToCart() {
        return this.configuration?.addToCartButtonText;
    }

    get isCTAButtonViewOptions() {
        return this.configuration?.viewOptionsButtonText;
    }

    get quantitySelectorClassList() {
        return `quantitySelector ${this.showInlineQuantitySelector ? 'quantitySelector--combined' : ''}`;
    }

    get subscriptionOptionsLabelText() {
        return i18n.subscriptionOptionsLabel;
    }

    // get isSubscriptionProduct() {
    //     // Safeguard: Ensure displayData is defined and is an object with productClass property
    //     const productClass = this.displayData?.productClass;
    
    //     // Check if productClass is a non-empty string before calling toLowerCase
    //     if (typeof productClass === 'string') {
    //         return productClass.toLowerCase() === PRODUCT_CLASS.SUBSCRIPTION.toLowerCase();
    //     } else {
    //         // Log or handle the case where productClass is not a string
    //         console.warn('productClass is not a valid string:', productClass);
    //         return false;
    //     }
    // }
    
    
    
    

    handleProductDetailPageNavigation(event) {
        this.updateCallToActionButtonUrl();
        navigate(this._navigationContext, {
            url: this._productUrl,
        });
    }

    handleKeydown(event) {
        if (event.key === EVENT.KEYBOARD.SPACE || event.key === EVENT.KEYBOARD.RETURN) {
            event.preventDefault();
            this.handleProductDetailPageNavigation(event);
        }
    }

    handleAddToCart(event) {
        // Add your add-to-cart logic here
    }

    renderedCallback() {
        if (!imageSizesDefined(this._imageSizes)) {
            calculateImageSizes(this.querySelector('.imageArea'), this._imageSizes);
        }
    }

    updateCallToActionButtonUrl() {
        if (!this._navigationContext) {
            return;
        }
        const product = this.displayData;
        if (!product) {
            return;
        }
        try {
            const url = generateUrl(this._navigationContext, {
                type: 'comm__namedPage',
                attributes: {
                    name: 'ProductDetail',
                },
                state: {
                    productId: product.id,
                },
            });
            
            // Ensure url is a Promise, if not handle it directly
            if (url && typeof url.then === 'function') {
                url.then((resolvedUrl) => {
                    this._productUrl = resolvedUrl;
                }).catch(error => {
                    console.error('Error generating URL:', error);
                });
            } else {
                // Handle the case where generateUrl does not return a Promise
                this._productUrl = url;
            }
        } catch (error) {
            console.error('Error updating call to action button URL:', error);
        }
    }
    
}