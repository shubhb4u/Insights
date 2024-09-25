import { LightningElement } from 'lwc';

export default class SearchComponent extends LightningElement {
    inputClass = 'search-input';
    cancelIconClass = 'cancel-icon';
    wrapperClass = 'search-wrapper';

    openSearchInput() {
        this.inputClass = 'search-input visible';
        this.cancelIconClass = 'cancel-icon visible';
        this.wrapperClass = 'search-wrapper visible';
        this.template.querySelector('.search-input').focus();
    }

    closeSearchInput() {
        this.inputClass = 'search-input';
        this.cancelIconClass = 'cancel-icon';
        this.wrapperClass = 'search-wrapper';
        this.template.querySelector('.search-input').value = ''; // Clear the input field when closed
    }

    handleBlur(event) {
        // Close the search input when it loses focus
        if (!this.template.querySelector('.search-wrapper').contains(event.relatedTarget)) {
            this.closeSearchInput();
        }
    }
}