import { LightningElement, track } from 'lwc';
import createLead from '@salesforce/apex/LeadController.createLead';

export default class AtlasChild1 extends LightningElement {
    @track email = '';
    @track showSuccessMessage = false;
    @track emailError = false;

    handleInputChange(event) {
        this.email = event.target.value;
        this.validateEmail(event);
    }

    validateEmail(event) {
        const emailInput = event.target;
        const isValidEmail = this.isValidEmail(this.email);

        if (!isValidEmail) {
            emailInput.setCustomValidity('Please enter a valid corporate email.');
            this.emailError = true;
        } else {
            emailInput.setCustomValidity('');
            this.emailError = false;
        }

        emailInput.reportValidity();
    }

    isValidEmail(email) {
        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    handleSubmit(event) {
        event.preventDefault();
        const emailInput = this.template.querySelector('#email');
        if (emailInput.checkValidity()) {
            createLead({ email: this.email })
                .then(() => {
                    this.showSuccessMessage = true;
                    this.resetForm();
                })
                .catch(error => {
                    console.error('Error creating lead: ', error);
                });
        }
    }

    resetForm() {
        this.email = '';
        this.emailError = false;
    }
}