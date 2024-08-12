import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getProductRecs from '@salesforce/apex/DisplayProductRecords.getProductRecs';
import getProductDiscountList from '@salesforce/apex/DisplayProductRecords.getProductRecsForDiscount';
import { addItemToCart } from 'commerce/cartApi';

export default class DisplayProductRecords extends NavigationMixin(LightningElement) {
    @track products;
    @track productDiscountList;
    @track displayedProducts = [];
    @track carouselIndicators = [];
    @track currentPage = 0;
    @track itemsPerPage = 4;
    @track product2;
    

    @wire(getProductDiscountList)
    wiredProductDiscountList({ error, data }) {
        if (data) {
            this.productDiscountList = data;
            console.log('Product discount list received:', this.productDiscountList);
        } else if (error) {
            console.error('Error retrieving product discount list:', error);
        }
    }

    connectedCallback() {
        this.fetchProducts();

        // Initialize counter values for each product
        this.displayedProducts.forEach(product => {
            this.productCounters[product.Id] = 1;
        });
    }

    fetchProducts() {
        getProductRecs()
            .then((data) => {
                this.products = data.map(product => {
                    let discountedPrice = this.getFinalPrice(product);
                    return {
                        ...product,
                        formattedUnitPrice: this.formatPrice(discountedPrice),
                        isDiscounted: this.productDiscountList.some(discountProduct => discountProduct.Id === product.Product2.Id)
                    };
                });
                this.setupCarousel();
                console.log('this.products --->>>>>  ', this.products);
            })
            .catch((error) => {
                console.error('Error fetching products:', error);
            });
    }

    getFinalPrice(product) {
        this.showMSRP = false;
        let finalPrice = product.UnitPrice;

        // Ensure productDiscountList is defined and not empty
        if (this.productDiscountList && this.productDiscountList.length > 0) {
            const matchingDiscountProduct = this.productDiscountList.find(discountProduct => discountProduct.Id === product.Product2.Id);

            if (matchingDiscountProduct) {
                if (matchingDiscountProduct.isDiscounted__c) {
                    this.showMSRP = true;
                    finalPrice -= parseFloat((matchingDiscountProduct.AdjustmentPercent__c / 100) * finalPrice);
                    console.log('Discount applied. Final price:', finalPrice);
                } else if (matchingDiscountProduct.isDiscountedAmount__c) {
                    this.showMSRP = true;
                    finalPrice -= matchingDiscountProduct.Adjustment_Amount__c;
                    console.log('Discount applied. Final price:', finalPrice);
                }
            }
        } else {
            console.warn('productDiscountList is undefined or empty. Returning original price.');
        }

        return finalPrice;
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

    

    handleBuy(event) {
        const productId = event.target.dataset.id;
        let productName = event.target.dataset.name;

        console.log('productId: --->>>> ', productId);
        console.log('productName: ---->>>> ', productName);

        addItemToCart(productId, 1);
        window.location.href = 'https://etgdigital6-dev-ed.develop.my.site.com/InsightsB2B/cart';

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
}