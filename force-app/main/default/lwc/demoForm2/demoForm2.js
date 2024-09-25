import { LightningElement, track } from 'lwc';
import createLead from '@salesforce/apex/LeadController.createLead';

export default class PricingForm extends LightningElement {
    @track businessEmail = '';
    @track businessEmailError = false;
    @track primaryFinancialSystem = '';
    @track financialSystemVersion = '';
    @track showSuccessMessage = false;
     

    handleInputChange(event) {
        const field = event.target.name;
        if (field === 'businessEmail') {
            this.businessEmail = event.target.value;
            this.validateEmail(event);
        } else if (field === 'primaryFinancialSystem') {
            this.primaryFinancialSystem = event.target.value;
        } else if (field === 'financialSystemVersion') {
            this.financialSystemVersion = event.target.value;
        }
    }
    validateEmail(event) {
        const emailInput = event.target;
        const isValidEmail = this.isValidEmail(this.businessEmail);

        if (!isValidEmail) {
            emailInput.setCustomValidity('Please enter a valid corporate email.');
            this.businessEmailError = true;
        } else {
            emailInput.setCustomValidity('');
            this.businessEmailError = false;
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
        const emailInput = this.template.querySelector('[name="businessEmail"]');

        // Check if email is valid
        if (!this.businessEmail) {
            emailInput.setCustomValidity('Please enter a valid corporate email.');
            emailInput.reportValidity();
            return;
        }

        if (emailInput.checkValidity()) {
            createLead({ email: this.businessEmail, primarySystem: this.primaryFinancialSystem, systemVersion: this.financialSystemVersion })
                .then(() => {
                    this.showSuccessMessage = true;
                    this.resetForm();
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000); // Refresh the page after 3 seconds
                })
                .catch(error => {
                    console.error('Error creating lead: ', error);
                });
        } else {
            this.validateEmail({ target: emailInput });
        }
    }

    resetForm() {
        this.businessEmail = '';
        this.primaryFinancialSystem = '';
        this.financialSystemVersion = '';
        this.businessEmailError = false;
        const emailInput = this.template.querySelector('[name="businessEmail"]');
        if(emailInput){
            emailInput.setCustomValidity('');
            emailInput.reportValidity();
        }
    }
}