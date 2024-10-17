import { LightningElement, track } from 'lwc';

export default class Slideshow extends LightningElement {
    @track slideIndex = 1;
    
    @track slides = [
        {
            id: 1,
            image: 'https://www.example.com/img_nature_wide.jpg',
            alt: 'Nature Image',
            caption: 'Caption Text',
            numberText: '1 / 3',
            display: 'display: block',
            dotClass: 'dot active'
        },
        {
            id: 2,
            image: 'https://www.example.com/img_snow_wide.jpg',
            alt: 'Snow Image',
            caption: 'Caption Two',
            numberText: '2 / 3',
            display: 'display: none',
            dotClass: 'dot'
        },
        {
            id: 3,
            image: 'https://www.example.com/img_mountains_wide.jpg',
            alt: 'Mountain Image',
            caption: 'Caption Three',
            numberText: '3 / 3',
            display: 'display: none',
            dotClass: 'dot'
        }
    ];

    // Show the next slide
    handleNext() {
        this.showSlides(this.slideIndex += 1);
    }

    // Show the previous slide
    handlePrev() {
        this.showSlides(this.slideIndex -= 1);
    }

    // Handle dot click to jump to a specific slide
    handleDotClick(event) {
        const slideId = parseInt(event.target.dataset.id, 10);
        this.showSlides(this.slideIndex = slideId);
    }

    // Function to update the slides and dots
    showSlides(n) {
        if (n > this.slides.length) {
            this.slideIndex = 1;
        }
        if (n < 1) {
            this.slideIndex = this.slides.length;
        }

        this.slides = this.slides.map((slide, index) => {
            return {
                ...slide,
                display: this.slideIndex === index + 1 ? 'display: block' : 'display: none',
                dotClass: this.slideIndex === index + 1 ? 'dot active' : 'dot'
            };
        });
    }
}