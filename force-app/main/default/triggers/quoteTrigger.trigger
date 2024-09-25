trigger quoteTrigger on SBQQ__Quote__c (before insert) {

    if(Trigger.isAfter){
        if(Trigger.isInsert){
            // updateOrderFromQuoteHandler.updateOrderedCheckboxOnQuote(Trigger.new);
        }
    }
}