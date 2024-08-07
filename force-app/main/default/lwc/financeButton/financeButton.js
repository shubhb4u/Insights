import { LightningElement, wire, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class FinanceButton extends LightningElement {

    @api isFinanceReporting = false;
    @api isFinanceReportingGetInstantDemo = false;
    @api isCloseConsolidation = false;
    @api isBusinessIntelligence = false;

    @api url;

    handleClick() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: this.url
            }
        });
    }

    @wire(CurrentPageReference)
    setCurrentPageReference(pageRef) {
        this.pageRef = pageRef;
        this.checkPageType();
    }

    checkPageType() {
        if (this.pageRef && this.pageRef.state) {
            const url = window.location.pathname; // Get the current URL pathname
            const urlParts = url.split('/'); // Split by "/"
            const lastName = urlParts[urlParts.length - 1]; // Get the last element

            this.isFinanceReporting = lastName === 'financial-reporting';
            this.isFinanceReportingGetInstantDemo = lastName === 'finance-reporting';
            this.isCloseConsolidation = lastName === 'close-consolidation';
            this.isBusinessIntelligence = lastName === 'business-intelligence';
        }
    }


    handleClick() {
        const event = new CustomEvent('buttonclick', {
            detail: { message: 'Button clicked!' }
        });
        this.dispatchEvent(event);
    }
}