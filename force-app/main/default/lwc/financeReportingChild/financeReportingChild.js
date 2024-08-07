import { LightningElement, wire, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class FinanceReportingChild extends LightningElement {
    @api isFinanceReporting = false;
    @api isCloseConsolidation = false;
    @api isBusinessIntelligence = false;


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
            this.isCloseConsolidation = lastName === 'close-consolidation';
            this.isBusinessIntelligence = lastName === 'business-intelligence';
        }
    }
}