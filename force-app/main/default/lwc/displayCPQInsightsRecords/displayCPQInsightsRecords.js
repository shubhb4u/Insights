import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import fetchQuotes from '@salesforce/apex/DisplayQuoteRecords.DisplayCPQQuoteRecs';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import CONTACT_ID from "@salesforce/schema/User.ContactId";
import USER_ID from "@salesforce/user/Id";
import ACCOUNT_ID from "@salesforce/schema/User.Contact.AccountId";

export default class DisplayCPQInsightsRecords extends NavigationMixin(LightningElement) {
    @track Quotes;
    // @track contactId;
    @track accountId;
    @track quoteId;
    @track downloadPdfUrl = '';
    @track contentDist;


    @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID, ACCOUNT_ID] })
    user({ data, error }) {
        if (data) {
            // this.contactId = getFieldValue(data, CONTACT_ID);
            this.accountId = getFieldValue(data, ACCOUNT_ID);
            console.log('DisplayQuoteRecords accountId ->>>', this.accountId);
            // console.log('DisplayQuoteRecords contactId ->>>', this.contactId);
            this.retrieveQuotes();
        } else if (error) {
            console.error('Error fetching user data:', error);
        }
    }

    // Fetch the contactId of the current user
    retrieveQuotes() {
        if (this.accountId) {
            console.log('DisplayQuoteRecords this.accountId ->>>', this.accountId);
            // Fetch quotes only if contactId is available
            fetchQuotes({ accountId: this.accountId })
                .then(result => {
                    console.log('DisplayQuoteRecords for CPQ results ->>>', result);
                    this.Quotes = result;

                    // Adding a property to our quotes to hide/display download button
                    // this.Quotes.forEach((el) => {
                    //     el.showButton = el.Status === 'Approved' || el.Status === 'Accepted';
                    // });
                })
                .catch(error => {
                    console.error('Error fetching quotes:', error);
                });
        }
    }

    handleViewCode(event) {
        const quoteId = event.target.dataset.quoteId;
        const quoteName = event.target.dataset.quoteName; // Retrieve quote name dynamically
        console.log('quoteId', quoteId);
        console.log('quoteName', quoteName);
        
        // Encode the quoteName to handle spaces and special characters
        const encodedQuoteName = encodeURIComponent(quoteName);
        
        // Construct the URL with dynamic parameters
        const url = `https://etgdigital6-dev-ed.develop.my.site.com/InsightsB2B/quote/${quoteId}/${quoteName}`;
        console.log('url is ->>>', url);

        if(url){

            // Navigate to the constructed URL
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: url
                }
            });
        }
        
    }

    
}