import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import fetchQuoteDetails from '@salesforce/apex/IndividualCPQRecords.getCPQQuoteRecord';
import AcceptQuote from '@salesforce/apex/IndividualCPQRecords.acceptCPQQuoteRecord';
import ClearCartandAddCartItems from '@salesforce/apex/IndividualCPQRecords.clearCartandAddQuoteLines';
import CreateCartAndAddQuoteLinesIntoCart from '@salesforce/apex/IndividualCPQRecords.createCartAndAddQuoteLinesIntoCart';
import { CartSummaryAdapter } from "commerce/cartApi";
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import ACCOUNT_ID from '@salesforce/schema/User.AccountId';

export default class IndividualCPQInsightsRecords extends LightningElement {
    //@track queryParams = {};
    @track quoteId;
    @track showSuccessMessage=false;
    @track showExpiredErrorMessage=false;
    @track ShowApprovedErrorMessage = false;
    @track statusAccepted=false;
    percent = '%';
    currencyCode = '$';
    @track quote;
    @track CartId;
    @track isDiscounted = false;
    @track accountId;
    @wire(CurrentPageReference) pageRef;

    @wire(CartSummaryAdapter)
    setCartSummary({ data, error }) {
        if (data) {
            console.log("Cart Id for CPQ records -->>>", data.cartId);
            console.log("Cart", data);
            this.CartId = data.cartId;
        } else if (error) {
            console.error(error);
        }
    }

    @wire(getRecord, { recordId: USER_ID, fields: [ACCOUNT_ID] })
    userRecord({ error, data }) {
        if (data) {
            this.accountId = getFieldValue(data, ACCOUNT_ID);
            console.log('User AccountId for CPQ records -->>>:-->>', this.accountId);
        } else if (error) {
            console.error('Error fetching user account ID:', error);
        }
    }

    connectedCallback() {
        // Once the component is connected, retrieve the URL parameters
        console.log('pageRef', this.pageRef);
        if (this.pageRef && this.pageRef.attributes) {
            console.log('Inside first if condition');
            const recordId = this.pageRef.attributes.recordId;
            console.log('recordId for CPQ records -->>>', recordId);
            if (recordId) {
                console.log('recordId inside if for CPQ records -->>>', recordId);
                this.quoteId=recordId;
                this.getQuoteDetails();
            }
        }
    }

    getQuoteDetails() {
        if (this.quoteId) {
            console.log('Quote Id for CPQ records -->>>->>>', this.quoteId);
            // Fetch quotes only if contactId is available
            fetchQuoteDetails({ quoteId: this.quoteId })
                .then(result => {

                    console.log('Display Quote Details ->>>', result);
                    console.log('Quote Details ->>>', result.SBQQ__Status__c);
                    this.quote=result;
                    if(result.SBQQ__AdditionalDiscountAmount__c !== 0){
                        this.isDiscounted = true;
                    }
                    console.log('isDiscounted -->>' + this.isDiscounted);
                    if(result.SBQQ__Status__c =='Accepted'){
                        this.statusAccepted=true;
                    }
                    // Format the subtotal and total price and discount
                    this.quote.formattedSubtotal = this.formatPrice(this.quote.SBQQ__ListAmount__c);
                    this.quote.formattedTotalPrice = this.formatPrice(this.quote.SBQQ__NetAmount__c);
                    this.quote.formattedDiscount = this.formatDiscount(this.quote.SBQQ__AdditionalDiscountAmount__c);
                    this.quote.formattedExpirationDate = this.formatDate(this.quote.SBQQ__ExpirationDate__c);
                    //this.Quotes = result;

                    // let number = this.quote.discount;
                    // this.discount = number.toFixed(2);
                    // console.log('discount ->>>', this.discount);
                })
                .catch(error => {
                    console.error('Error fetching quotes:', error);
                });
        }
    }


    acceptQuote(){
        AcceptQuote({ quoteId: this.quoteId })
        .then(result => {
            console.log('Result: for CPQ records -->>> ',result);
            if(result== 'success'){
                this.showSuccessMessage=true;
                console.log('CartId outside if condition ->>>' +this.CartId );
                if(this.CartId !=null){
                    console.log('CartId inside if condition->>>' +this.CartId );
                    this.ClearCartandAddCartItemsToStore();
                }
                else{
                    console.log('Null cartId');
                    this.createCartAndAddItems();
                }
                console.log('Quote Accepted succesfully ->>>');
            }
            else if(result == 'expired'){
                this.showExpiredErrorMessage = true;
                console.log('the quote is expired');
            }
            else if(result == 'not approved'){
                this.ShowApprovedErrorMessage = true;
                console.log('only approved quotes can be accepted');
            }
            else{

                console.log('Quote Accept failed ->>>');
            }
        })
        .catch(error => {
            console.error('Error while accepting the quote:', error);
        });
    }

    ClearCartandAddCartItemsToStore(){
        console.log('Inside ClearCartandAddCartItemsToStore cart Id: ->>>'+this.CartId);
        ClearCartandAddCartItems({quoteId: this.quoteId,cartId:this.CartId})
        .then(result => {
            if(result){
                console.log('Quote lines added into the cart succesfully ->>>');
            }
            else{
                console.log('failed when adding the quote lines into the cart->>>');
            }
        })
        .catch(error => {
            console.error('Error while adding the quote lines:', error);
        });
    }

    createCartAndAddItems(){
        console.log('Inside createCartAndAddItems');
        CreateCartAndAddQuoteLinesIntoCart({quoteId: this.quoteId,accountId: this.accountId})
        
        .then(result => {
            console.log('Results ->>>' +result);
            if(result){
                console.log('Quote lines added into the cart succesfully ->>>');
            }
            else{
                console.log('failed when adding the quote lines into the cart->>>');
            }
        })
        .catch(error => {
            console.error('Error while adding the quote lines:', error);
        });
    }


    formatPrice(price) {
        return Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    formatDiscount(discount) {
        return Number(discount).toFixed(2);
    }
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
}