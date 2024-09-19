public without sharing class updateOrderFromQuoteHandler {
    
    public static void updateOrderedCheckboxOnQuote(List<SBQQ__Quote__c> quoteList) {
        try {
            Set<Id> quoteIds = new Set<Id>();

            // Collect Quote IDs
            for (SBQQ__Quote__c quo : quoteList) {
                quoteIds.add(quo.Id);
            }

            System.debug('quoteIds are -->> ' + quoteIds);

            List<SBQQ__Quote__c> updateQuoteList = new List<SBQQ__Quote__c>();

            // If there are quote IDs, query and update them
            if (!quoteIds.isEmpty()) {
                Map<Id, SBQQ__Quote__c> quoteMap = new Map<Id, SBQQ__Quote__c>(
                    [SELECT Id, SBQQ__Ordered__c 
                     FROM SBQQ__Quote__c 
                     WHERE Id IN :quoteIds 
                     AND SBQQ__Ordered__c = false]
                );

                System.debug('quoteMap is -->> ' + quoteMap);

                if (!quoteMap.isEmpty()) {
                    for (SBQQ__Quote__c quo : quoteMap.values()) {
                        quo.SBQQ__Ordered__c = true;
                        updateQuoteList.add(quo);
                    }
                }

                System.debug('updateQuoteList are -->> ' + updateQuoteList);
            }

            // Update the list of Quotes
            if (!updateQuoteList.isEmpty()) {
                try {
                    update updateQuoteList;
                } catch (DmlException dmle) {
                    System.debug('DML Exception while updating quotes: ' + dmle.getMessage());
                }
            }

        } catch (Exception e) {
            System.debug('Error updating the checkbox -->> ' + e.getMessage());
        }
    }
}
