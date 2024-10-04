global class ProcessUnprocessedQuotesBatch implements Database.Batchable<SObject>, Database.Stateful, Schedulable {

    global Integer recordsProcessed = 0;
    global List<Id> successfullyProcessedQuoteIds = new List<Id>();
    public List<Id> quoteIdsExplicit = new List<Id>(); 

    // Default constructor when no IDs are passed, falls back to querying in start
    public ProcessUnprocessedQuotesBatch() {
        System.debug('No Quote passed, default constructor used.');
    }

    // Constructor to fire the class explicitly from backend with a list of Quote IDs
    public ProcessUnprocessedQuotesBatch(List<Id> quoteIdList) {
        quoteIdsExplicit = quoteIdList; 
        System.debug('Quote IDs passed to the constructor are -->>>> ' + quoteIdsExplicit);
    }

    // Start method to query SBQQ__Quote__c records where Is_Processed_Insights__c is not checked
    global Database.QueryLocator start(Database.BatchableContext bc) {
        if (!quoteIdsExplicit.isEmpty()) {
            // Query for the specific Quote records based on the passed IDs
            String query = 'SELECT Id, Name, Is_Processed_Insights__c, SBQQ__Ordered__c ' +
                           'FROM SBQQ__Quote__c WHERE Id IN :quoteIdsExplicit';
            return Database.getQueryLocator(query);
        } else {
            // If no Quote IDs are passed, run the predefined query
            String query = 'SELECT Id, Name, Is_Processed_Insights__c, SBQQ__Ordered__c ' +
                           'FROM SBQQ__Quote__c WHERE Is_Processed_Insights__c = false ' +
                           'AND SBQQ__Ordered__c = false ' +
                           'AND Order_from_B2B_store_Insights__c = true';
            return Database.getQueryLocator(query);
        }
    }

    global void execute(Database.BatchableContext bc, List<SBQQ__Quote__c> scope) {
        try {
            // Avoid unnecessary DML if the list is empty
            if (scope != null && !scope.isEmpty()) {
                for (SBQQ__Quote__c quote : scope) {
                    // Process each quote and mark it as ordered
                    quote.SBQQ__Ordered__c = true;
                    quote.Is_Processed_Insights__c = true;

                    // Collect the ID of successfully processed quotes
                    successfullyProcessedQuoteIds.add(quote.Id);
                    recordsProcessed = recordsProcessed + 1;
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

    // Finish method to handle post-processing and call another batch class
    global void finish(Database.BatchableContext bc) {
        

        // Call another batch class and pass the successfully processed quote IDs
        if (!successfullyProcessedQuoteIds.isEmpty()) {

            // Get the ID of the AsyncApexJob representing this batch job
                AsyncApexJob a = [SELECT Id, Status, NumberOfErrors, JobItemsProcessed,
                TotalJobItems, CreatedBy.Email
                FROM AsyncApexJob WHERE Id = :bc.getJobId()];

                // Send an email to the Apex job's submitter notifying of job completion
                Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                String[] toAddresses = new String[] {a.CreatedBy.Email};
                mail.setToAddresses(toAddresses);
                mail.setSubject('ProcessUnprocessedQuotesBatch ' + a.Status);
                mail.setPlainTextBody('The batch Apex job processed ' + a.TotalJobItems + ' batches with ' + a.NumberOfErrors + ' failures.');
                Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });

                
                System.debug('Passing successfully processed Quote IDs to the next batch: ' + successfullyProcessedQuoteIds);
                Database.executeBatch(new generateContract_Insights(successfullyProcessedQuoteIds), 1); 
        }
    }

    // Execute method for the Schedulable interface
    global void execute(SchedulableContext sc) {
        Database.executeBatch(new ProcessUnprocessedQuotesBatch(), 200);
    }
}
