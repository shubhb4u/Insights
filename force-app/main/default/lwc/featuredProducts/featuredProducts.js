import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getProductRecs from '@salesforce/apex/FeaturedProductsController.getFeaturedProductsInsights';
import { addItemToCart } from 'commerce/cartApi'


export default class FeaturedProductsController extends NavigationMixin(LightningElement) {
    @track products;
    @track displayedProducts = [];
    @track carouselIndicators = [];
    @track currentPage = 0;
    @track itemsPerPage = 4;

    connectedCallback() {
        this.fetchProducts();
    }

    fetchProducts() {
        getProductRecs()
            .then((data) => {
                this.products = data;
                this.setupCarousel();
                console.log(' this.products', this.products);
            })
            .catch((error) => {
                console.error('Error fetching products:', error);
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

    handleBuy(event) {
        const productId = event.target.dataset.id;
        let productName = event.target.dataset.name; // Use let instead of const

        addItemToCart(productId, 1);
        location.reload();
      
        console.log('event.target.dataset: ', event.target.dataset);
        console.log('event.target: ', event.target);
    
        console.log('productId: ', productId);
    
        // Convert the product name to lowercase
        productName = productName.toLowerCase();
    
        console.log('productName: ', productName);
    
        // Define the URL
       // let url = `https://etgdigital6-dev-ed.develop.my.site.com/InsightsB2B/product/${productName}/${productId}`;
       // console.log('url is ->> ', url);
    
       /*this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: url
            }
        });*/
    }
    
}