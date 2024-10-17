import { LightningElement } from 'lwc';

export default class CarouselComponent extends LightningElement {
    // Tracks which image is currently displayed
    isFirstImage = true;
    isSecondImage = false;

    // Navigate to the previous image
    previousImage() {
        if (this.isSecondImage) {
            this.isFirstImage = true;
            this.isSecondImage = false;
        }
    }

    // Navigate to the next image
    nextImage() {
        if (this.isFirstImage) {
            this.isFirstImage = false;
            this.isSecondImage = true;
        }
    }
    
}