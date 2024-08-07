import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAvailableProducts from '@salesforce/apex/ProductControllers.getAvailableProducts';

export default class ProductRedirectComponent extends NavigationMixin(LightningElement) {
    @track product;
    @track error;

    @wire(getAvailableProducts)
    wiredProducts({ error, data }) {
        if (data) {
            this.product = data[0]; // Assume we only need the first product for redirection
            this.error = undefined;
        } else if (error) {
            console.error('Error fetching products:', error);
            this.error = error.body.message;
            this.product = undefined;
        }
    }

    handleRedirect() {
        if (this.product) {
            const productId = this.product.Id;
            const productName = this.product.Name;

            // Format product name to be URL-friendly
            const formattedProductName = productName
                .toLowerCase()                  // Convert to lowercase
                .replace(/ /g, '-')             // Replace spaces with hyphens
                .replace(/[^\w\-]+/g, '');      // Remove non-alphanumeric characters except hyphens

            // Construct URL for the Experience Builder (Community) site
            const communityUrl = `https://etgdigital6-dev-ed.develop.my.site.com/solarwinds/product/${formattedProductName}/${productId}`;
            console.log('URL for product view:', communityUrl);

            // Redirect to the Experience Builder (Community) page
            window.location.href = communityUrl; // Use window.location.href for external URL
        } else {
            console.warn('No product available to redirect to.');
        }
    }
}