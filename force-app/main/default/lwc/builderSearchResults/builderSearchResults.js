/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { createCartItemAddAction, createSearchFiltersUpdateAction, dispatchAction,createCommonQuantityUpdateAction } from 'commerce/actionApi';
import CommonModal from 'c/commonModal';
import { Labels } from './labels';
 
/**
 * @typedef {import('../searchResults/searchResults').ProductSearchResultSummary} ProductSearchResultSummary
 */
 
/**
 * @typedef {import('../searchResults/searchResults').CardContentMappingItem} CardContentMappingItem
 */
 
/**
 * Component that displays products for search and category page.
 */
export default class BuilderSearchResults extends LightningElement {
    static renderMode = 'light';
 
    @wire(NavigationContext)
    navContext;
    // connectedCallback() {
    //     console.log('Search results:', this.searchResults);
    //     console.log('Card collection:', this.searchResults?.cardCollection);
    //     if (this.navContext && this.navContext.state && this.navContext.state.quantity) {
    //         this.selectedQuantity = this.navContext.state.quantity; // Or whatever variable you want to use
    //     }
    // }
    connectedCallback() {
        // Log the entire search results object for inspection
        console.log('Search results:', this.searchResults);
    
        // Check if cardCollection exists and is an array
        if (this.searchResults?.cardCollection && Array.isArray(this.searchResults.cardCollection)) {
            this.searchResults.cardCollection.forEach(product => {
                // Log the product details, including prices
                console.log(`Product ID: ${product.id}, Name: ${product.name}, Original Price: ${product.originalPrice}, Negotiated Price: ${product.negotiatedPrice}`);
            });
        } else {
            console.warn('No products found or cardCollection is not an array.');
        }
    
        // Existing quantity handling code
        if (this.navContext && this.navContext.state && this.navContext.state.quantity) {
            this.selectedQuantity = this.navContext.state.quantity; // Use the quantity state if needed
        }
    }
    
 
    /**
     * Results returned from the Search Data Provider
     * @type {?ProductSearchResultSummary}
     */
    @api
    searchResults;
 
    /**
     * Default field to show in results
     * @type {?string}
     */
    @api
    searchResultsFields;
 
    /**
     * The layout of the results tiles.
     * @type {?('grid' | 'list')}
     */
    @api
    resultsLayout;
 
    /**
     * The size of the spacing between the grid columns.
     * @type {?('small' | 'medium' | 'large'| 'none')}
     */
    @api
    gridColumnSpacing;
 
    /**
     * The size of the spacing between the grid rows.
     * @type {?('small' | 'medium' | 'large'| 'none')}
     */
    @api
    gridRowSpacing;
 
    /**
     * The maximum number of grid columns to be displayed.
     * Accepted values are between 1 and 8.
     * @type {?number}
     */
    @api
    gridMaxColumnsDisplayed;
 
    /**
     * The size of the spacing between the list rows.
     * @type {?('small' | 'medium' | 'large'| 'none')}
     */
    @api
    listRowSpacing;
 
    /**
     * Font color for the card background field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     */
    @api
    cardBackgroundColor;
 
    /**
     * The alignment of the results cards.
     * @type {?('right' | 'center' | 'left')}
     */
    @api
    cardAlignment;
 
    /**
     * Font color for the card border field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     */
    @api
    cardBorderColor;
 
    /**
     * The value of the border radius for the results card.
     * @type {?string}
     */
    @api
    cardBorderRadius;
 
    /**
     * Font color for the card divider field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     */
    @api
    cardDividerColor;
 
    /**
     * The font size of the negotiated price.
     * @type {?('small' | 'medium' | 'large')}
     */
    @api
    negotiatedPriceTextSize;
 
    /**
     * Whether to display the negotiated price.
     * @type {boolean}
     * @default false
     */
    @api
    showNegotiatedPrice = false;

    /**
     * Font color for the negotiated price text field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     */
    @api
    negotiatedPriceTextColor;
 
    /**
     * Whether to display the original price.
     * @type {boolean}
     * @default false
     */
    @api
    showOriginalPrice = false;
 
    /**
     * The font size of the original price.
     * @type {?('small' | 'medium' | 'large')}
     */
    @api
    originalPriceTextSize;
 
    /**
     * Font color for the original price text field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     */
    @api
    originalPriceTextColor;
 
    /**
     * Whether to display the product image.
     * @type {boolean}
     * @default false
     */
    @api
    showProductImage = false;
    
    /**
     * The product fields to display in the productCard cmp.
     * @type {string}
     */
    @api
    cardContentMapping;
 
    /**
     * Whether to display the action button.
     * @type {boolean}
     * @default false
     */
    @api
    showCallToActionButton = false;
 
    /**
     * The text for the add to cart button
     * @type {?string}
     */
    @api
    addToCartButtonText;
 
    /**
     * The button style for add to cart button
     * Accepted values primary, secondary, tertiary
     * @type {?('primary' | 'secondary' | 'tertiary')}
     */
    @api
    addToCartButtonStyle;
 
    /**
     * The text for the add to cart button when cart is processing
     * @type {?string}
     */
    @api
    addToCartButtonProcessingText;
 
    /**
     * The text for the view options button
     * @type {?string}
     */
    @api
    viewOptionsButtonText;
 
    /**
     * The current page number of the results.
     * @type {?string}
     */
    @api
    currentPage;
      // Existing properties for minimum and maximum
      quantitySelectorConfig = {
        minimum: 1,
        maximum: 100,
        step: 1,
        label: 'Quantity',
        hideButtons: false,
        hideLabel: false,
        minimumValueGuideText: 'Minimum: {minimum}',
        maximumValueGuideText: 'Maximum: {maximum}',
        stepValueGuideText: 'Step: {step}'
    };

      @api minimum = 1;
      @api maximum = 99;

 
 // New properties for quantity selector
 
 @api quantitySelectorMinimum = 1;
 @api quantitySelectorMaximum = 99;
 @api quantitySelectorStep = 1;
 @api quantitySelectorLabel = 'Quantity';
 @api quantitySelectorHideButtons = false;
 @api quantitySelectorHideLabel = false;
 @api quantitySelectorMinimumValueGuideText = 'Minimum quantity is {minimum}';
 @api quantitySelectorMaximumValueGuideText = 'Maximum quantity is {maximum}';
 @api quantitySelectorStepValueGuideText = 'Quantity must be in increments of {step}'; 
 
 productQuantities = {};
    /**
     * @type {CardContentMappingItem[]}
     * @readonly
     * @private
     */
    get normalizedCardContentMapping() {
        return JSON.parse(this.cardContentMapping ?? '[]');
    }
 
    /**
     * Handles the 'addproducttocart' event.
     * Adds the product to the cart and then on success opens the add to cart modal.
     * @param {CustomEvent<{ productId: string; quantity: number }>} event The event object
     * @private
     */
    /*
    handleAddToCart(event) {
        console.log('Product added:', event.target.dataset.id);
        event.stopPropagation();
        const { productId } = event.detail;
        const quantity = this.productQuantities[productId] || 1;
        dispatchAction(this, createCartItemAddAction(productId, quantity), {
            onSuccess: () => {
                CommonModal.open({
                    label: Labels.messageSuccessfullyAddedToCart,
                    size: 'small',
                    secondaryActionLabel: Labels.actionContinueShopping,
                    primaryActionLabel: Labels.actionViewCart,
                    onprimaryactionclick: () => this.navigateToCart(),
                });
            },
        });
    } */
        handleAddToCart(event) {
            console.log('Product added:', event.target.dataset.id);
            event.stopPropagation();
            
            // Get the product ID from the dataset
            const productId = event.target.dataset.id;
            
            // Retrieve the quantity for the product, fallback to 1 if not defined
            const quantity = this.productQuantities[productId] || 1;
            
            // Call dispatchAction to add the product to the cart
            dispatchAction(this, createCartItemAddAction(productId, quantity), {
                onSuccess: () => {
                    // Show success modal with options to continue shopping or view the cart
                    CommonModal.open({
                        label: Labels.messageSuccessfullyAddedToCart,
                        size: 'small',
                        secondaryActionLabel: Labels.actionContinueShopping,
                        primaryActionLabel: Labels.actionViewCart,
                        onprimaryactionclick: () => this.navigateToCart(),
                    });
                },
            });
        }
        
 
    /**
     * Navigates to the cart page when the primary button is clicked
     * from the modal after adding an item to the cart
     * @private
     */
    navigateToCart() {
        this.navContext &&
            navigate(this.navContext, {
                type: 'comm__namedPage',
                attributes: {
                    name: 'Current_Cart',
                },
            });
    }

    handleAddToCartNew(event){
        const productId  = '01tak000005W2VFAA0';
        const quantity = this.productQuantities[productId] || 1;

        // First add the item to the cart
        addItemToCart(productId, quantity)
        .then(() => {
            // After adding to the cart, show the toast
            this.showToast();
        })
        .catch((error) => {
            // Handle error, e.g., show a toast for error
            console.error('Error adding item to cart:', error);
            this.showErrorToast();
        });
        
        window.location.href = 'https://etgdigital6-dev-ed.develop.my.site.com/InsightsB2B/cart';
    }
 
    /**
     * Handles navigating to the product detail page from the search results page.
     * @param {CustomEvent<{productId: string; productName: string}>} event The event object
     */
    handleNavigateToProductPage(event) {
        event.stopPropagation();
        const urlName = this.searchResults?.cardCollection.find((card) => card.id === event.detail.productId)?.urlName;
         // Get the selected quantity for the product
        this.navContext &&
            navigate(this.navContext, {
                type: 'standard__recordPage',
                attributes: {
                    objectApiName: 'Product2',
                    recordId: event.detail.productId,
                    actionName: 'view',
                    urlName: urlName ?? undefined,
                },
                state: {
                    recordName: event.detail.productName,
                },
            });
    }
 
    /**
     * Trigger an update of the page number at the closest `SearchDataProvider`
     * @param {CustomEvent<{newPageNumber: number}>} event The event object
     * @private
     */
    handleUpdateCurrentPage(event) {
        event.stopPropagation();
        dispatchAction(this, createSearchFiltersUpdateAction({ page: event.detail.newPageNumber }));
    }
    handleQuantityChanged(event) {
        const productId = event.target.dataset.productId;
        const quantity = event.detail.value;
        this.productQuantities[productId] = quantity;
        dispatchAction(this, createCommonQuantityUpdateAction(quantity));

    }
}