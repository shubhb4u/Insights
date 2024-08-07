import { LightningElement, track } from 'lwc';

export default class DemoForm extends LightningElement {
    @track businessEmail = '';
    @track primaryFinancialSystem = '';
    @track financialSystemVersion = '';
    @track showMessage = false;

    financialSystemOptions = [
        { label: 'Financial System', value: 'financialSystem' },
        { label: 'Deltek', value: 'Deltek' },
        { label: 'Epicor', value: 'Epicor' },
        { label: 'Infor', value: 'Infor' },
        { label: 'JD Edwards', value: 'JD Edwards' },
        { label: 'Microsoft', value: 'Microsoft' },
        { label: 'MRI software', value: 'MRI software' },
        { label: 'Netsuite', value: 'Netsuite' },
        // Add more options as needed
    ];

    financialSystemVersionOptions = [
        { label: 'System Version', value: 'System version' },
        { label: '24 SevenOffice', value: '24 SevenOffice' },
        { label: 'AARO', value: 'AARO' },
        { label: 'AccountEdge ', value: 'AccountEdge' },
        { label: 'Accountmate', value: 'Accountmate' },
        { label: 'Accounting CSS', value: 'Accountmate' },
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