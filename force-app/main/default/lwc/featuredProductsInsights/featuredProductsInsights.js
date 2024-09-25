import { LightningElement, wire } from 'lwc';
import getFeaturedProducts from '@salesforce/apex/FeaturedProductsController.getFeaturedProductsInsights';
import { NavigationMixin } from 'lightning/navigation';

export default class FeaturedProductsInsights extends NavigationMixin(LightningElement) {
    @wire(getFeaturedProducts)
    products;

    handleBuyClick(event) {
        const productId = event.target.dataset.id;
        let productName = event.target.dataset.name; // Use 'let' to allow reassignment
        productName = productName.toLowerCase();
        console.log(productName);

        // Construct the URL based on your community site's structure
        const url = `https://etgdigital6-dev-ed.develop.my.site.com/InsightsB2B/product/${productName}/${productId}`;
        
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: url
            }
        });
    }
}