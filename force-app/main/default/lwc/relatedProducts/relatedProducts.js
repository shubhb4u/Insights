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

    
    connectedCallback() {
        this.fetchProducts();
        this.getProductDiscountList();
    }

    fetchProducts() {
        getProductRecs()
            .then((data) => {
                this.products = data.map(product => {
                    const discountedPrice = this.getFinalPrice(product);
                    let showMSRP = false;
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

    getProductDiscountList() {
        getProductDiscountList()
            .then((data) => {
                this.productDiscountList = data;
                console.log('productDiscountList is -->>> ', this.productDiscountList);
            })
            .catch((error) => {
                console.log('Error getting discount product list ', error);
            });
    }

    getFinalPrice(product) {
        let finalPrice = product.UnitPrice;

        const matchingDiscountProduct = this.productDiscountList.find(discountProduct => discountProduct.Id === product.Product2.Id);

        if (matchingDiscountProduct) {
            this.showMSRP = true;
            if (matchingDiscountProduct.isDiscounted__c) {
                finalPrice -= (matchingDiscountProduct.AdjustmentPercent__c / 100) * finalPrice;
                console.log('Discount applied. Final price:', finalPrice);
            } else if (matchingDiscountProduct.isDiscountedAmount__c) {
                finalPrice -= matchingDiscountProduct.Adjustment_Amount__c;
                console.log('Discount applied. Final price:', finalPrice);
            }
        } else {
            this.showMSRP = false;
        }

        return finalPrice;
    }
    

    formatPrice(price) {

        // console.log('price is - >>>>> ', price);
        // console.log('Adjustment_Amount__c is - >>>>> ', product2.Adjustment_Amount__c);
        // console.log('AdjustmentPercent__c is - >>>>> ', product2.AdjustmentPercent__c);
        // console.log('isDiscounted__c is - >>>>> ', product2.isDiscounted__c);
        // console.log('isDiscountedAmount__c is - >>>>> ', product2.isDiscountedAmount__c);


        // let discountedPrice;
        // if(isDiscounted){
        //     discountedPrice = price - ((AdjustmentPercent/100) * price);
        //     console.log('discountedPrice from percent -->> ',discountedPrice );
        // }else if(isDiscountedAmount){
        //     discountedPrice = price - Adjustment_Amount;
        //     console.log('discountedPrice from amount -->> ',discountedPrice )
        // }else{
        //     discountedPrice = price;
        //     console.log('Normal Price -->> ', discountedPrice);
        // }

        return Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
        location.reload();


        

        
    }
}