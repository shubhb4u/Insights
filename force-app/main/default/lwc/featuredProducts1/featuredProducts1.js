import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getProductRecs from '@salesforce/apex/FeaturedProductsController.getProductRecs';
import getProductDiscountList from '@salesforce/apex/FeaturedProductsController.getProductRecsForDiscount';
import { addItemToCart } from 'commerce/cartApi';

export default class FeaturedProducts1 extends NavigationMixin(LightningElement) {
    @track products = [];
    @track productDiscountList = [];
    @track displayedProducts = [];
    @track carouselIndicators = [];
    @track currentPage = 0;
    @track itemsPerPage = 4;

    @wire(getProductDiscountList)
    wiredProductDiscountList({ error, data }) {
        if (data) {
            this.productDiscountList = data;
            this.fetchProducts(); // Fetch products only after discount list is available
        } else if (error) {
            console.error('Error retrieving product discount list:', error);
        }
    }

    fetchProducts() {
        getProductRecs()
            .then((data) => {
                this.products = data.map(product => {
                    let discountedPrice = this.getFinalPrice(product);
                    return {
                        ...product,
                        formattedUnitPrice: this.formatPrice(discountedPrice),
                        isDiscounted: this.productDiscountList.some(discountProduct => discountProduct.Id === product.Product2Id)
                    };
                });
                this.setupCarousel();
            })
            .catch((error) => {
                console.error('Error fetching products:', error);
            });
    }

    getFinalPrice(product) {
        let finalPrice = product.UnitPrice;
        const matchingDiscountProduct = this.productDiscountList.find(discountProduct => discountProduct.Id === product.Product2Id);

        if (matchingDiscountProduct) {
            if (matchingDiscountProduct.isDiscounted__c) {
                finalPrice -= parseFloat((matchingDiscountProduct.AdjustmentPercent__c / 100) * finalPrice);
            } else if (matchingDiscountProduct.isDiscountedAmount__c) {
                finalPrice -= matchingDiscountProduct.Adjustment_Amount__c;
            }
        }
        return finalPrice;
    }

    formatPrice(price) {
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    handleBuy(event) {
        const productId = event.target.dataset.id;
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
}