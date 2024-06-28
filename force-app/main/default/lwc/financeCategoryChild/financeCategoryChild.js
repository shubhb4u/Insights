import { LightningElement, wire, api, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class MyComponent extends LightningElement {
    

    @api isFinance = false;
    @api isAccounting = false;
    @api isAnalytics = false;
    @track showFirst = false;
    @track showSecond = false;
    @track showThird = false;
    @track showAccountingFirst = false;
    @track showAccountingSecond = false;
    @track showAccountingThird = false;
    @track showAccountingFourth = false;
    @track showDataAnalyticsFirst = false;
    @track showDataAnalyticsSecond = false;
    @track showDataAnalyticsThird = false;
    @track showDataAnalyticsFourth = false;

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
    
    

    //For finance page-------------------------------------------
    showFirstContent() {
        console.log('ShowFirst clicked !!')
        this.showFirst = true;
        this.showSecond = false;
        this.showThird = false;
    }

    showSecondContent() {
        this.showFirst = false;
        this.showSecond = true;
        this.showThird = false;
    }

    showThirdContent() {
        this.showFirst = false;
        this.showSecond = false;
        this.showThird = true;
    }

    //For accounting page-------------------------------------
    showFirstContentAccounting() {
        console.log('ShowFirst clicked !!')
        this.showAccountingFirst = true;
        this.showAccountingSecond = false;
        this.showAccountingThird = false;
        this.showAccountingFourth = false;
    }

    showSecondContentAccounting() {
        this.showAccountingFirst = false;
        this.showAccountingSecond = true;
        this.showAccountingThird = false;
        this.showAccountingFourth = false;
    }

    showThirdContentAccounting() {
        this.showAccountingFirst = false;
        this.showAccountingSecond = false;
        this.showAccountingThird = true;
        this.showAccountingFourth = false;
    }

    showFourthContentAccounting() {
        this.showAccountingFirst = false;
        this.showAccountingSecond = false;
        this.showAccountingThird = false;
        this.showAccountingFourth = true;
    }

    //For DataAnalytics page ----------------------------------
    showFirstContentDataAnalytics() {
        console.log('ShowFirst clicked !!')
        this.showDataAnalyticsFirst = true;
        this.showDataAnalyticsSecond = false;
        this.showDataAnalyticsThird = false;
        this.showDataAnalyticsFourth = false;
    }

    showSecondContentDataAnalytics() {
        this.showDataAnalyticsFirst = false;
        this.showDataAnalyticsSecond = true;
        this.showDataAnalyticsThird = false;
        this.showDataAnalyticsFourth = false;
    }

    showThirdContentDataAnalytics() {
        this.showDataAnalyticsFirst = false;
        this.showDataAnalyticsSecond = false;
        this.showDataAnalyticsThird = true;
        this.showDataAnalyticsFourth = false;
    }

    showFourthContentDataAnalytics() {
        this.showDataAnalyticsFirst = false;
        this.showDataAnalyticsSecond = false;
        this.showDataAnalyticsThird = false;
        this.showDataAnalyticsFourth = true;
    }

}