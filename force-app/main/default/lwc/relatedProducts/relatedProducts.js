import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getProductRecs from '@salesforce/apex/DisplayProductRecords.getProductRecs';
import getProductDiscountList from '@salesforce/apex/DisplayProductRecords.getProductRecsForDiscount';
import { addItemToCart } from 'commerce/cartApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DisplayProductRecords extends NavigationMixin(LightningElement) {
    @track products;
    @track productDiscountList;
    @track displayedProducts = [];
    @track carouselIndicators = [];
    @track currentPage = 0;
    @track itemsPerPage = 4;
    @track product2;
    @track productCounters = {}; // Store quantity for each product
    

    @wire(getProductDiscountList)
    wiredProductDiscountList({ error, data }) {
        if (data) {
            this.productDiscountList = data;
            console.log('Product discount list received:', this.productDiscountList);

            // After discount products are received, fetch the main product list
            this.fetchProducts(); 
        } else if (error) {
            console.error('Error retrieving product discount list:', error);
        }
    }

    
    fetchProducts() {
        getProductRecs()
            .then((data) => {
                this.products = data.map(product => {
                    // Ensure we have the correct discount price
                    let discountedPrice = this.getFinalPrice(product);
                    return {
                        ...product,
                        formattedUnitPrice: this.formatPrice(discountedPrice),
                        isDiscounted: this.isProductDiscounted(product.Product2.Id),
                        showMSRP: this.isProductDiscounted(product.Product2.Id) // Track if MSRP should be shown
                    };
                });
                
                this.setupCarousel();
                this.initializeProductCounters(); // Initialize counters after carousel setup
            })
            .catch((error) => {
                console.error('Error fetching products:', error);
            });
    }

    // Check if the product is discounted based on the productDiscountList
    isProductDiscounted(productId) {
        if (this.productDiscountList && this.productDiscountList.length > 0) {
            return this.productDiscountList.some(discountProduct => discountProduct.Id === productId);
        }
        return false;
    }

    // Get the final price of the product after applying discounts
    getFinalPrice(product) {
        let finalPrice = product.Product2.Final_price_Insights__c || product.UnitPrice;

        // Ensure productDiscountList is defined and not empty
        if (this.productDiscountList && this.productDiscountList.length > 0) {
            const matchingDiscountProduct = this.productDiscountList.find(discountProduct => discountProduct.Id === product.Product2.Id);

            if (matchingDiscountProduct) {
                if (matchingDiscountProduct.isDiscounted__c || matchingDiscountProduct.isDiscountedAmount__c) {
                    // Apply any specific logic to calculate final price based on discounts here
                    finalPrice = matchingDiscountProduct.Final_price_Insights__c || finalPrice;
                }
            }
        } else {
            console.warn('productDiscountList is undefined or empty. Returning original price.');
        }

        return finalPrice;
    }
    
    initializeProductCounters() {
        this.displayedProducts.forEach(product => {
            if (!this.productCounters[product.Id]) {
                this.productCounters[product.Id] = 1; // Default quantity to 1
            }
        });
    }

    
    formatPrice(price) {
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    setupCarousel() {
        this.updateDisplayedProducts();
        this.carouselIndicators = Array(Math.ceil(this.products.length / this.itemsPerPage)).fill().map((_, index) => {
            return {
                index,
                class: `splide__pagination__page ${index === this.currentPage ? 'is-active' : ''}`
            };
        });
    }

    updateDisplayedProducts() {
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.displayedProducts = this.products.slice(startIndex, endIndex);

        // Initialize counters for newly displayed products
        this.displayedProducts.forEach(product => {
            if (!this.productCounters[product.Id]) {
                this.productCounters[product.Id] = 1; // Default quantity to 1
            }
        });
    }

    handlePrevious() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.updateDisplayedProducts();
            this.updateIndicatorClasses();
        }
    }

    handleNext() {
        if (this.currentPage < this.carouselIndicators.length - 1) {
            this.currentPage++;
            this.updateDisplayedProducts();
            this.updateIndicatorClasses();
        }
    }

    handleIndicatorClick(event) {
        this.currentPage = parseInt(event.target.dataset.index, 10);
        this.updateDisplayedProducts();
        this.updateIndicatorClasses();
    }

    updateIndicatorClasses() {
        this.carouselIndicators = this.carouselIndicators.map((indicator) => {
            return {
                ...indicator,
                class: `splide__pagination__page ${indicator.index === this.currentPage ? 'is-active' : ''}`
            };
        });
    }


    handleQuantityChange(event) {
        console.log('Quantity change event:', event);
        const newQuantity = event.detail.quantity;
        const productId = event.detail.id;
    
        this.productCounters[productId] = newQuantity;
        console.log(`Product ID: ${productId}, New Quantity: ${newQuantity}`);
    }
    

    handleNavigate(event) {
        const productId = event.target.dataset.id;
        const productName = event.target.dataset.name;

        let url = `https://etgdigital6-dev-ed.develop.my.site.com/InsightsB2B/product/${productName}/${productId}`;
        this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes: {
                url: url
            },
        });
    }
    

    //Commenting this out to use the quantity selector component -- 
    handleBuy(event) {

        const productId = event.target.dataset.id; // Get the product ID
        const quantity = this.productCounters[productId] || 1; // Get the quantity or default to 1

        console.log('Product ID:', productId);
        console.log('Quantity:', quantity);
        
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
        
        // window.location.href = 'https://etgdigital6-dev-ed.develop.my.site.com/InsightsB2B/cart';


    }

    showToast() {
        console.log('Dispatching toast event');
        const event = new ShowToastEvent({
            title: 'Success', // You can customize the title
            message: 'Product has been added to the cart', // Customize the message
            variant: 'success', // Set the variant to 'success', 'error', 'warning', or 'info'
            mode: 'dismissable' // The mode can be 'dismissable', 'pester', or 'sticky'
        });
        this.dispatchEvent(event);

        return 'success';
    }

    showErrorToast() {
        const event = new ShowToastEvent({
            title: 'Error',
            message: 'Failed to add product to the cart',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }
}