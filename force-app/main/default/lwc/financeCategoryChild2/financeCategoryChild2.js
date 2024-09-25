import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';


export default class FinanceCategoryChild2 extends LightningElement {

    @api isFinance = false;
    @api isAnalytics = false;

    @wire(CurrentPageReference)
    setCurrentPageReference(pageRef) {
        this.pageRef = pageRef;
        this.setLastPathSegment();
    }

    setLastPathSegment() {
        if (this.pageRef && this.pageRef.state) {
            const url = window.location.pathname; // Get the current URL pathname
            const urlParts = url.split('/'); // Split by "/"
            const lastname = urlParts[urlParts.length - 1]; // Get the last element

            if (lastname === 'finance') {
                this.isFinance = true;
            } 
            else {
                this.isAnalytics = true;
            }
        }
    }
}