import { LightningElement, wire, track } from 'lwc';
import getAccounts from'@salesforce/apex/AccountService.getAccounts';

export default class SearchAccount extends LightningElement {
    @track searchKey;
    @wire(getAccounts,{strAccountName: '$searchKey'}) accounts;
    handleKeyChange(event){
        this.searchKey=event.target.value;
    }
}