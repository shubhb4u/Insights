global class generateContract_Insights implements Database.Batchable<SObject>, Database.Stateful {

    public final List<Id>  quoteIds;
    global Integer recordsProcessed = 0;

    //Constructor to fire the class explicitly from backend
    public generateContract_Insights(List<Id> quoIds){

            quoteIds = quoIds; 
            System.debug('quoIds for contracting class are -->>>> '+ quoteIds);
    }

    // Start method to query SBQQ__Quote__c records where Is_Processed_Insights__c is not checked
    global Database.QueryLocator start(Database.BatchableContext bc) {
        String query = 'select id, SBQQ__Contracted__c, SBQQ__Quote__c, Contracted_From_Batch_class_Insights__c, Status from Order where SBQQ__Quote__c in : quoteIds and SBQQ__Contracted__c = false';
        return Database.getQueryLocator(query);
    }

    global void execute(Database.BatchableContext bc, List<Order> scope) {

        try {
            // Avoid unnecessary DML if the list is empty
            if (scope != null && !scope.isEmpty()) {
                for (Order  ord : scope) {
                    // Process each quote and mark it as ordered
                    ord.Status = 'Activated';
                    ord.SBQQ__Contracted__c = true;
                    ord.Contracted_From_Batch_class_Insights__c = true;
                    recordsProcessed = recordsProcessed + 1;

                }
                
                update scope; 
                System.debug('Successfully contracted -->>    ' + scope.size() + ' orders.');
            } else {
                System.debug('No -->>>> orders to process in this batch.');
            }
        } catch (DmlException e) {
            // Handle DML errors and log them
            System.debug('Error creating orders:-->>>> ' + e.getMessage());
        } 
    }

    // Finish method to handle post-processing and call another batch class
    global void finish(Database.BatchableContext bc) {
        // Get the ID of the AsyncApexJob representing this batch job
        AsyncApexJob a = [SELECT Id, Status, NumberOfErrors, JobItemsProcessed,
                           TotalJobItems, CreatedBy.Email
                           FROM AsyncApexJob WHERE Id = :BC.getJobId()];

        // Send an email to the Apex job's submitter notifying of job completion
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        String[] toAddresses = new String[] {a.CreatedBy.Email};
        mail.setToAddresses(toAddresses);
        mail.setSubject('ProcessUnprocessedQuotesBatch ' + a.Status);
        mail.setPlainTextBody('The batch Apex job processed ' + a.TotalJobItems + ' batches with ' + a.NumberOfErrors + ' failures.');
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });

    }

    // Execute method for the Schedulable interface
    global void execute(SchedulableContext sc) {
        Database.executeBatch(new ProcessUnprocessedQuotesBatch(), 1);
    }
}
