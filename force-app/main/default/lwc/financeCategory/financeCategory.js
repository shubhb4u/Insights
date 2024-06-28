import { LightningElement, wire, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class FinanceCategory extends LightningElement {

    @api isFinance = false;
    @api isAccounting = false;
    @api isAnalytics = false;
    @api isFinancialReporting = false;
    @api isCloseandConsolidation = false;
    @api isBusinessIntelligence = false;
    @api isClausionConsolidation = false
    @api isPowerOn = false;
    @api isAtlas = false;

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
            } else if (lastname === 'accounting') {
                this.isAccounting = true;
            } else if (lastname === 'financial-reporting') {
                this.isFinancialReporting = true;
            }else if (lastname === 'close-consolidation') {
                this.isCloseandConsolidation = true;
            }else if (lastname === 'business-intelligence') {
                this.isBusinessIntelligence = true;
            }else if (lastname === 'clausion-consolidation') {
                this.isClausionConsolidation = true;
            }else if (lastname === 'atlas') {
                this.isAtlas = true;
            }else if (lastname === 'power-on') {
                this.isPowerOn = true;
            }
            else {
                this.isAnalytics = true;
            }
        }
    }
}