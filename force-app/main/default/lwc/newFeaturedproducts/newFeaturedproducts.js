import { LightningElement, wire } from 'lwc';
import getFeaturedRecs from '@salesforce/apex/FeaturedPro.getFeaturedRecs';
import { NavigationMixin } from 'lightning/navigation';

export default class FeaturedProducts extends NavigationMixin(LightningElement) {
    @wire(getFeaturedRecs)
    products;

    handleBuyClick(event) {
        const productId = event.target.dataset.id;
        let productName = event.target.dataset.name.toLowerCase();
        console.log(productName);

        // Construct the URL based on your community site's structure
        const url = `https://etgdigital6-dev-ed.develop.my.site.com/InsightsB2B/product/${encodeURIComponent(productName)}/${productId}`;
        
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: url
            }
        });
    }
}