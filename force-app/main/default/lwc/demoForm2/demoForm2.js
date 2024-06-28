import { LightningElement, track } from 'lwc';

export default class PricingForm extends LightningElement {
    @track businessEmail = '';
    @track primaryFinancialSystem = '';
    @track financialSystemVersion = '';
    @track showMessage = false;

    financialSystemOptions = [
        { label: 'Financial System 1', value: 'financialSystem1' },
        { label: 'Financial System 2', value: 'financialSystem2' },
        // Add more options as needed
    ];

    financialSystemVersionOptions = [
        { label: 'Version 1', value: 'version1' },
        { label: 'Version 2', value: 'version2' },
        // Add more options as needed
    ];

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

    handleButtonClick() {
        this.showMessage = true;
    }
}