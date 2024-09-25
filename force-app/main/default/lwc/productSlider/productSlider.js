import { LightningElement, track } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import splideResource from '@salesforce/resourceUrl/splide';

export default class ProductSlider extends LightningElement {
    @track products = [
        {
            id: 1,
            name: 'Toad Data Modeler',
            description: 'Create high-quality data models and easily deploy accurate changes to …',
            price: 286.45,
            originalPrice: 337.00,
            discount: 15,
            wishListClass: 'q-wish-list added'
        },
        {
            id: 2,
            name: 'erwin Data Modeler',
            description: 'The industry-leading enterprise data modeling software.',
            price: 286.45,
            originalPrice: null,
            discount: null,
            wishListClass: 'q-wish-list'
        },
        {
            id: 3,
            name: 'Data Modeler',
            description: 'The industry-leading enterprise data modeling software.',
            price: 28.45,
            originalPrice: null,
            discount: null,
            wishListClass: 'q-wish-list'
        },
        {
            id: 4,
            name: 'erwin Data Modeler 4',
            description: 'The industry-leading enterprise data modeling software.',
            price: 28600.45,
            originalPrice: null,
            discount: null,
            wishListClass: 'q-wish-list'
        },
        // Add more products as needed
    ];

    renderedCallback() {
        if (this.splide) {
            return;
        }

        Promise.all([
            loadScript(this, splideResource + '/splide.min.js'),
            loadStyle(this, splideResource + '/splide.min.css')
        ])
        .then(() => {
            this.initializeCarousel();
        })
        .catch(error => {
            console.error('Error loading Splide resources', error);
        });
    }

    initializeCarousel() {
        const carousel = this.template.querySelector('.splide');
        this.splide = new Splide(carousel, {
            type       : 'loop',
            perPage    : 2,
            perMove    : 1,
            autoplay   : true,
            pagination : true,
            arrows     : true,
        }).mount();
    }
}