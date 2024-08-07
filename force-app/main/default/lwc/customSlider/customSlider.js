import { LightningElement, wire, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class CustomSlider extends LightningElement {


    @api isFinanceReporting = false;
    @api isCloseConsolidation = false;
    @api isBusinessintelligence = false;

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
            this.isBusinessintelligence = lastName === 'business-intelligence';
        }
    }

    handleFinanceButtonClick() {
        // Handle button click logic here (e.g., navigate to a different page)
        console.log('Finance button clicked!');
      }
}