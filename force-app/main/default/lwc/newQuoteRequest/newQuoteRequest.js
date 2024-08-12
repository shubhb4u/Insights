import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; // Import Toast Event
import createQuote from '@salesforce/apex/RequestQuoteController.createQuote';
import { CartSummaryAdapter } from "commerce/cartApi";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import CONTACT_ID from "@salesforce/schema/User.ContactId";
import USER_FIRST_NAME from "@salesforce/schema/User.FirstName";
import USER_LAST_NAME from "@salesforce/schema/User.LastName";
import USER_EMAIL from "@salesforce/schema/User.Email";
import USER_ID from "@salesforce/user/Id";
import ACCOUNT_ID from '@salesforce/schema/User.AccountId';

export default class NewQuoteRequest extends LightningElement {
    @api recordId;
    @api effectiveAccountId;
    @track CartId;
    @track requestQuoteBy;
    @track reasonForQuote;
    @track requestQuoteByError;
    @track reasonForQuoteError;
    @track contactId;
    @track accountId;
    @track userName;
    @track userEmail; // Track user email
    @track showSuccessMessage;
    //For Credit Limit check -
    @track isCreditAvailable = false;
    @track creditAmount;
    @track cartgrandTotal;
    @track creditVal = 1;

    @wire(CartSummaryAdapter)
    setCartSummary({ data, error }) {
        if (data) {
            console.log('Cart Id is loaded');
            console.log("Cart Id", data.cartId);
            console.log("Cart", data);
            this.CartId = data.cartId;
            this.cartgrandTotal = data.grandTotalAmount;
            console.log('cartgrandTotal is ', this.cartgrandTotal );

        } else if (error) {
            console.error(error);
        }
    }


    @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID, USER_FIRST_NAME, USER_LAST_NAME, USER_EMAIL, ACCOUNT_ID] })
    user({ data, error }) {
        if (data) {
            this.contactId = getFieldValue(data, CONTACT_ID);
            this.userName = getFieldValue(data, USER_FIRST_NAME) + ' ' + getFieldValue(data, USER_LAST_NAME);
            this.userEmail = getFieldValue(data, USER_EMAIL); // Get user email
            this.accountId = getFieldValue(data, ACCOUNT_ID);

            console.log('data ->>>', this.contactId);
            console.log('userName ->>>', this.userName);
            console.log('userEmail ->>>', this.userEmail); // Log user email
            console.log('this.accountId ->>>', this.accountId);
        } else if (error) {
            console.error('Error fetching user data:', error);
        }
    }

    connectedCallback() {
        console.log('Welcome to JS:');
        console.log('cartId in connectedCallback:', this.CartId);
    }

    

    renderedCallback() {
        console.log('cartId in renderedCallback:', this.CartId);
    }

    handleRequestQuoteByChange(event) {
        this.requestQuoteBy = event.target.value;
    }

    handleReasonForQuoteChange(event) {
        this.reasonForQuote = event.target.value;
    }

    handleCreateQuote() {
        this.requestQuoteByError = '';
        this.reasonForQuoteError = '';

        if (!this.requestQuoteBy || !this.reasonForQuote) {
            if (!this.requestQuoteBy) {
                this.requestQuoteByError = 'This field is required and cannot be empty';
            }
            if (!this.reasonForQuote) {
                this.reasonForQuoteError = 'This field is required and cannot be empty';
            }
            return;
        }

        const currentDate = new Date();
        const selectedDate = new Date(this.requestQuoteBy);
        if (selectedDate < currentDate.setHours(0, 0, 0, 0)) {
            this.requestQuoteByError = 'Quote Requested date cannot be in the past';
            return;
        }

        if (this.CartId) {
            console.log('this.contactId', this.contactId);
            console.log('this.CartId', this.CartId);
            console.log('this.requestQuoteBy', this.requestQuoteBy);
            console.log('this.reasonForQuote', this.reasonForQuote);
            console.log('this.userName', this.userName);
            console.log('this.userEmail', this.userEmail); // Log user email
            console.log('this.accountId ->>>', this.accountId);
            createQuote({
                cartId: this.CartId,
                requestQuoteBy: this.requestQuoteBy,
                reasonForQuote: this.reasonForQuote,
                contactId: this.contactId,
                userName: this.userName,
                userEmail: this.userEmail, // Pass user email to Apex
                accountId: this.accountId,
                cartGrandTotal: this.grandTotalAmount
            })
                .then(response => {
                    // Handle successful response
                    console.log('Quote created successfully:', response);
                    this.showSuccessMessage = true;
                    this.resetForm();
                })
                .catch(error => {
                    // Handle error
                    console.error('Error creating quote:', error);
                    // Dispatch error message
                });
        } else {
            console.error('No cart details available.');
        }
    }

    resetForm() {
        this.requestQuoteBy = '';
        this.reasonForQuote = '';
        this.requestQuoteByError = '';
        this.reasonForQuoteError = '';
    }


}