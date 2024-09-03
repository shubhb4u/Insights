import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; 
import createOpportunityForQuote from '@salesforce/apex/RequestQuoteController.createOpportunityForQuote';
import { CartSummaryAdapter } from "commerce/cartApi";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import USER_ID from "@salesforce/user/Id";
import ACCOUNT_OWNERID from '@salesforce/schema/User.Account.OwnerId';
import ACCOUNT_NAME from '@salesforce/schema/User.Account.Name';

export default class CreateOpportunityCPQInsights extends LightningElement {

    @track CartId;
    @track AccountId;
    @track accountOwnerId;
    @track accountName;

    @wire(CartSummaryAdapter)
    setCartSummary({ data, error }) {
        if (data) {
            console.log("Cart from createOpportunity component->>>>", data);
            this.CartId = data.cartId;
            this.AccountId =  data.accountId;
            console.log("AccountId->>>>", data.accountId);

        } else if (error) {
            console.error(error);
        }
    }

    @wire(getRecord, { recordId: USER_ID, fields: [ ACCOUNT_OWNERID, ACCOUNT_NAME] })
        user({ data, error }) {
            if (data) {
                this.accountOwnerId = getFieldValue(data, ACCOUNT_OWNERID);
                this.accountName = getFieldValue(data, ACCOUNT_NAME);

                console.log('this.accountOwnerId ->>>', this.accountOwnerId);
            } else if (error) {
                console.error('Error fetching user data:', error);
        }
    }



    requestQuoteHandler(){

        if(this.CartId && this.AccountId && this.accountOwnerId){

            createOpportunityForQuote({cartId: this.CartId, accountId: this.AccountId, accountOwnerId: this.accountOwnerId, accountName: this.accountName})
            .then(response=>{
                // Handle successful response
                console.log('Calling showToast');
                this.showToast('Success', 'Our sales representative will get in touch with you soon.', 'success');
                
            })
            .catch(error => {
                // Handle error
                console.error('Error creating opportunity:', error);
            });
        }
        
    }


    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}