import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import fetchQuotes from '@salesforce/apex/DisplayQuoteRecords.DisplayQuoteRecs';
// import getDownloadLink from '@salesforce/apex/DisplayQuoteRecords.getDownloadLink';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import CONTACT_ID from "@salesforce/schema/User.ContactId";
import USER_ID from "@salesforce/user/Id";

export default class DisplayQuotesNew extends NavigationMixin(LightningElement){


    @track Quotes;
    @track contactId;
    @track quoteId;
    @track downloadPdfUrl = '';
    @track contentDist;
    @track quotesLength;

    connectedCallback() {
        console.log('Welcome to DisplayQuoteRecords:');
        console.log('contactId:', this.contactId);
    }

    @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID] })
    user({ data, error }) {
        if (data) {
            this.contactId = getFieldValue(data, CONTACT_ID);
            console.log('DisplayQuoteRecords data ->>>', this.contactId);
            console.log('DisplayQuoteRecords contactId ->>>', this.contactId);
            this.retrieveQuotes();
        } else if (error) {
            console.error('Error fetching user data:', error);
        }
    }

    // Fetch the contactId of the current user
    retrieveQuotes() {
        if (this.contactId) {
            console.log('DisplayQuoteRecords this.contactId ->>>', this.contactId);
            // Fetch quotes only if contactId is available
            fetchQuotes({ contactId: this.contactId })
                .then(result => {
                    console.log('DisplayQuoteRecords results ->>>', result);
                    this.Quotes = result;
                    this.quotesLength = this.Quotes.length;

                    // Adding a property to our quotes to hide/display download button
                    this.Quotes.forEach((el) => {
                        el.showButton = el.Status === 'Approved' || el.Status === 'Accepted';
                    });
                })
                .catch(error => {
                    console.error('Error fetching quotes:', error);
                });
        }
    }

    handleViewCode(event) {
        console.log('handleViewCode triggered'); 
        const quoteId = event.target.dataset.quoteId;
        const quoteName = event.target.dataset.quoteName;
        
        if (quoteId && quoteName) {
            const encodedQuoteName = encodeURIComponent(quoteName);
            const url = `https://etgdigital6-dev-ed.develop.my.site.com/InsightsB2B/quote/${quoteId}/${encodedQuoteName}`;
            console.log('Navigating to URL:', url);
    
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: url
                }
            });
        } else {
            console.error('Missing quoteId or quoteName.');
        }
    }

    // Handler for downloading quote PDF
    // handleDownloadQuotePdf(event) {
    //     this.quoteId = event.target.dataset.quoteDownid;
    //     console.log('Quote id for download pdf is ->>', this.quoteId);
    //     if (this.quoteId) {
    //         console.log('Quote Id for downloading quote is -->> ' + this.quoteId);
    //         // Fetch quotes only if contactId is available
    //         getDownloadLink({ quoId: this.quoteId })
    //             .then(result => {
    //                 this.contentDist = result;
    //                 console.log('contentDist link is  ->>>', result);
    //                 this.navigateToDownloadPDF();
    //             })
    //             .catch(error => {
    //                 console.error('Error fetching contentDist:', error);
    //             });
    //     }
    // }

    // navigateToDownloadPDF() {
    //     // Navigate to the constructed URL
    //     this[NavigationMixin.Navigate]({
    //         type: 'standard__webPage',
    //         attributes: {
    //             url: this.contentDist
    //         }
    //     });
    // }
}