global class ProcessUnprocessedQuotesBatch implements Database.Batchable<SObject>, Schedulable {

    // Start method to query SBQQ__Quote__c records where Is_Processed_Insights__c is not checked
    global Database.QueryLocator start(Database.BatchableContext bc) {
        String query = 'SELECT Id, Name, Is_Processed_Insights__c, SBQQ__Ordered__c FROM SBQQ__Quote__c WHERE Is_Processed_Insights__c = false and SBQQ__Ordered__c = false and Order_from_B2B_store_Insights__c = true';
        return Database.getQueryLocator(query);
    }

    
    global void execute(Database.BatchableContext bc, List<SBQQ__Quote__c> scope) {
        try {
            // Avoid unnecessary DML if the list is empty
            if (scope != null && !scope.isEmpty()) {
                for (SBQQ__Quote__c quote : scope) {

                    quote.SBQQ__Ordered__c = true;
                    quote.Is_Processed_Insights__c = true;
                }
                
                update scope; 
                System.debug('Successfully updated ' + scope.size() + ' quotes.');
            } else {
                System.debug('No records to process in this batch.');
            }
        } catch (DmlException e) {
            // Handle DML errors and log them
            System.debug('Error updating quotes: ' + e.getMessage());
        } 
    }

    // Finish method to handle post-processing if needed
    global void finish(Database.BatchableContext bc) {
        System.debug('Batch job completed successfully.');
    }

    // Execute method for the Schedulable interface
    global void execute(SchedulableContext sc) {
        Database.executeBatch(new ProcessUnprocessedQuotesBatch(), 200);
    }
}