import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import fetchQuoteDetails from '@salesforce/apex/IndividualQuoteRecords.getQuoteRecord';
import AcceptQuote from '@salesforce/apex/IndividualQuoteRecords.acceptQuoteRecord';
import ClearCartandAddCartItems from '@salesforce/apex/IndividualQuoteRecords.clearCartandAddQuoteLines';
import { CartSummaryAdapter } from "commerce/cartApi";

export default class IndividualQuoteRecords extends LightningElement {
    //@track queryParams = {};
    @track quoteId;
    @track showSuccessMessage=false;
    @track showExpiredErrorMessage=false;
    @track ShowApprovedErrorMessage = false;
    @track statusAccepted=false;
    @track quote;
    @track CartId;
    @wire(CurrentPageReference) pageRef;

    @wire(CartSummaryAdapter)
    setCartSummary({ data, error }) {
        if (data) {
            console.log("Cart Id", data.cartId);
            console.log("Cart", data);
            this.CartId = data.cartId;
        } else if (error) {
            console.error(error);
        }
    }

    connectedCallback() {
        // Once the component is connected, retrieve the URL parameters
        console.log('pageRef', this.pageRef);
        if (this.pageRef && this.pageRef.attributes) {
            console.log('Inside first if condition');
            const recordId = this.pageRef.attributes.recordId;
            console.log('recordId', recordId);
            if (recordId) {
                console.log('recordId inside if', recordId);
                this.quoteId=recordId;
                this.getQuoteDetails();
            }
        }
    }
    getQuoteDetails() {
        if (this.quoteId) {
            console.log('Quote Id ->>>', this.quoteId);
            // Fetch quotes only if contactId is available
            fetchQuoteDetails({ quoteId: this.quoteId })
                .then(result => {

                    console.log('Display Quote Details ->>>', result);
                    console.log('Quote Details ->>>', result.Status);
                    this.quote=result;
                    if(result.Status =='Accepted'){
                        this.statusAccepted=true;
                    }
                    //this.Quotes = result;
                })
                .catch(error => {
                    console.error('Error fetching quotes:', error);
                });
        }
    }
    acceptQuote(){
        AcceptQuote({ quoteId: this.quoteId })
        .then(result => {
            console.log('Result: ',result);
            if(result== 'success'){
                this.showSuccessMessage=true;
                if(this.CartId !=null){
                    this.ClearCartandAddCartItemsToStore();
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
}