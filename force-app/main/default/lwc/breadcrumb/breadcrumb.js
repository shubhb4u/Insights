import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class BreadcrumbComponent extends NavigationMixin(LightningElement) {
    currentStage = '';
    cartClass = '';
    checkoutClass = '';
    orderClass = '';

    connectedCallback() {
        this.currentStage = this.getCurrentStageFromUrl();
        this.updateBreadcrumbClasses();
    }

    getCurrentStageFromUrl() {
        // Extract stage from URL path
        const path = window.location.pathname;
        if (path.includes('cart')) {
            return 'cart';
        } else if (path.includes('checkout')) {
            return 'checkout';
        } else if (path.includes('order')) {
            return 'order';
        }
        return ''; // Default if no stage is matched
    }

    updateBreadcrumbClasses() {

        // // Update visibility based on the current stage
        // this.showCart = this.currentStage === 'cart' || this.currentStage === 'checkout' || this.currentStage === 'order';
        // this.showCheckout = this.currentStage === 'checkout' || this.currentStage === 'order';
        // this.showOrderConfirmation = this.currentStage === 'order';
        
        // // Update class names based on the current stage
        // this.cartClass = this.currentStage === 'cart' || this.currentStage === 'checkout' || this.currentStage === 'order' ? 'active' : '';
        // this.checkoutClass = this.currentStage === 'checkout' || this.currentStage === 'order' ? 'active' : '';
        // this.orderClass = this.currentStage === 'order' ? 'active' : '';

          // Update class names based on the current stage
          this.cartClass = this.currentStage === 'cart' ? 'active' : '';
          this.checkoutClass = this.currentStage === 'checkout' ? 'active' : '';
          this.orderClass = this.currentStage === 'order' ? 'active' : '';

    }

    handleNavigateCart() {
        if (this.currentStage !== 'cart') {
            this.navigateToPage('cart');
        }
    }

    handleNavigateCheckout() {
        if (this.currentStage !== 'checkout') {
            this.navigateToPage('checkout');
        }
    }

    navigateToPage(stage) {
        let pageUrl = '';
        if (stage === 'cart') {
            pageUrl = '/InsightsB2B/cart';
        } else if (stage === 'checkout') {
            pageUrl = '/InsightsB2B/checkout';
        }

        // Use navigation service to navigate to the selected page
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: pageUrl
            }
        });
    }
}