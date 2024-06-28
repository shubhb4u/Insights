import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';

export default class LearnMoreButton_Insights extends NavigationMixin(LightningElement) {
    @api isFinance = false;
    @api isAccounting = false;
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
                this.isAccounting = false;
                this.isAnalytics = false;
            } else if (lastname === 'accounting') {
                this.isFinance = false;
                this.isAccounting = true;
                this.isAnalytics = false;
            } else {
                this.isFinance = false;
                this.isAccounting = false;
                this.isAnalytics = true;
            }
        }
    }

    navigateToFinance() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: 'https://etgdigital6-dev-ed.develop.my.site.com/InsightsB2B/finance' 
            }
        });
    }

    navigateToAccounting() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: 'https://etgdigital6-dev-ed.develop.my.site.com/InsightsB2B/accounting' 
            }
        });
    }

    navigateToDefault() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: 'https://etgdigital6-dev-ed.develop.my.site.com/InsightsB2B/finance' 
            }
        });
    }
}
