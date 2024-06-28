import { LightningElement, api, wire, track } from "lwc";
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; // Import Toast Event
import createQuoteWithLineItems from "@salesforce/apex/RequestQuoteController.createQuoteWithLineItems";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import CONTACT_ID from "@salesforce/schema/User.ContactId";
import USER_ID from "@salesforce/user/Id";


export default class QuoteForProduct extends LightningElement {
    @api recordId; // Id of the current product record
    @track quantityForQuote;
    @track requestQuoteBy;
    @track reasonForQuote;
    @track requestQuoteByError;
    @track reasonForQuoteError;
    @track quantityForQuoteError;
    @track quoteSubmitted = false;
    @track currentRecordId;
    @track contactId;
    @track insertedQuoteData;
    @track showSuccessMessage = false;

    connectedCallback() {
        this.currentRecordId = this.recordId;
        console.log("recordId -->>" + this.recordId);

    }

    //Getting the current logged in customer  contact -
    @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID] })
    user({ data, error }) {
        if (data) {
            this.contactId = getFieldValue(data, CONTACT_ID);
            console.log("data ->>>", this.contactId);
        } else if (error) {
            console.error("Error fetching user data:", error);
        }
    }

    //Handle data received by user from markup - 
    handleRequestQuoteByChange(event) {
        this.requestQuoteBy = event.target.value;
    } 

    handleQuantityForQuoteChange(event) {
        this.quantityForQuote = event.target.value;
    }

    handleReasonForQuoteChange(event) {
        this.reasonForQuote = event.target.value;
    }


    //Call apex class when submit button is clicked  - 
    handleCreateQuote() {
        this.requestQuoteByError = '';
        this.reasonForQuoteError = '';
        this.quantityForQuoteError = '';
        if (!this.requestQuoteBy || !this.reasonForQuote || !this.quantityForQuote) {
            if(!this.requestQuoteBy){
                this.requestQuoteByError = 'This field is required and can not be empty';
            }
            if(!this.reasonForQuote){
                this.reasonForQuoteError = 'This field is required and can not be empty';
            }
            if(!this.quantityForQuote){
                this.quantityForQuoteError = 'This field is required and can not be empty';
            }
            return;
        }
        createQuoteWithLineItems({
            productId: this.recordId,
            qty: this.quantityForQuote,
            requestQuoteBy: this.requestQuoteBy,
            reason: this.reasonForQuote,
            contactId: this.contactId
        })
            .then((result) => {
                console.log("Quote created successfully:", result);
                this.quoteSubmitted = true;
                this.showSuccessMessage = true;
                
                this.insertedQuoteData = result;
                console.log('insertedQuoteData -->>',  this.insertedQuoteData);
                
            })
            .catch((error) => {
                console.error("Error creating quote:", error);
            });
    }
}