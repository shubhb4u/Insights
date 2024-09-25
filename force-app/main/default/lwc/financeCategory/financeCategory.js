import { LightningElement, wire, api, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import createLead from '@salesforce/apex/LeadController.createLead';

export default class FinanceCategory extends LightningElement {
    @api isFinance = false;
    @api isAccounting = false;
    @api isAnalytics = false;
    @api isFinancialReporting = false;
    @api isCloseandConsolidation = false;
    @api isBusinessIntelligence = false;
    @api isClausionConsolidation = false;
    @api isPowerOn = false;
    @api isAtlas = false;

    @track email = '';
    @track showSuccessMessage = false;
    @track showErrorMessage = false;
    @track emailMessage = '';
    @track emailErrorFlag = false;

    @wire(CurrentPageReference)
    setCurrentPageReference(pageRef) {
        this.pageRef = pageRef;
        this.setLastPathSegment();
    }

    setLastPathSegment() {
        if (this.pageRef && this.pageRef.state) {
            const url = window.location.pathname;
            const urlParts = url.split('/');
            const lastname = urlParts[urlParts.length - 1];

            if (lastname === 'finance') {
                this.isFinance = true;
            } else if (lastname === 'accounting') {
                this.isAccounting = true;
            } else if (lastname === 'financial-reporting') {
                this.isFinancialReporting = true;
            } else if (lastname === 'close-consolidation') {
                this.isCloseandConsolidation = true;
            } else if (lastname === 'business-intelligence') {
                this.isBusinessIntelligence = true;
            } else if (lastname === 'clausion-consolidation') {
                this.isClausionConsolidation = true;
            } else if (lastname === 'atlas') {
                this.isAtlas = true;
            } else if (lastname === 'power-on') {
                this.isPowerOn = true;
            } else {
                this.isAnalytics = true;
            }
        }
    }

    handleInputChange(event) {
        this.email = event.target.value;
        this.validateEmail();
    }

    validateEmail() {
        const trimmedEmail = this.email ? this.email.trim() : '';
        if (!trimmedEmail) {
            this.emailMessage = "Business Email is required field.";
            this.emailErrorFlag = false;
        } else if (!trimmedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            this.emailMessage = 'Please enter a valid corporate email.';
            this.emailErrorFlag = false;
        } else {
            this.emailMessage = '';
            this.emailErrorFlag = true;
        }
    }

    handleSubmit() {

        this.showErrorMessage = false;
        this.showSuccessMessage = false;

        if(!this.email){
            this.emailMessage = "Business Email is required field.";
            this.showErrorMessage = true;
            return;
        }

        if(!this.emailErrorFlag){
            this.showErrorMessage = true;
            return;
        }

        createLead({ email: this.email })
            .then(() => {
                this.showSuccessMessage = true;
                // Optionally reset the email input
                this.email = '';
                console.log('Lead Created successfully');
                this.resetForm();
            })
            .catch(error => {
                console.error('Error creating lead: ', error);
            });
    }
    resetForm(){
        this.email = '';
        this.emailMessage = '';
        this.emailErrorFlag = false;
        console.log('inside reset form method');
    }
}