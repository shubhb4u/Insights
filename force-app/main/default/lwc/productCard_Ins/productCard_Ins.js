import { LightningElement, track } from 'lwc';
import getProductRecs from '@salesforce/apex/DisplayProductRecords.getProductRecs';

export default class ProductCard_Ins extends LightningElement {


    @track products;

    connectedCallback() {
        this.fetchProducts();
    }

    fetchProducts() {
        getProductRecs()
            .then((data) => {
                this.products = data;
                console.log(' this.products', this.products);
            })
            .catch((error) => {
                console.error('Error fetching products:', error);
            });
    }

}