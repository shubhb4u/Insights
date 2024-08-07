import { LightningElement, track } from 'lwc';
import createLead from '@salesforce/apex/LeadController.createLead';

export default class PricingForm extends LightningElement {
    @track businessEmail = '';
    @track primaryFinancialSystem = '';
    @track financialSystemVersion = '';
    @track showSuccessMessage = false;

    handleInputChange(event) {
        const field = event.target.name;
        if (field === 'businessEmail') {
            this.businessEmail = event.target.value;
        } else if (field === 'primaryFinancialSystem') {
            this.primaryFinancialSystem = event.target.value;
        } else if (field === 'financialSystemVersion') {
            this.financialSystemVersion = event.target.value;
        }
    }

    handleSubmit(event) {
        event.preventDefault();
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
    }

    resetForm() {
        this.businessEmail = '';
        this.primaryFinancialSystem = '';
        this.financialSystemVersion = '';
    }
}