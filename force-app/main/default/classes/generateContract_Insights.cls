/*********************************************************************************
 * Created By:          Shubham Mazumdar
 * Created Date:        10/18/2024
 * Purpose:             generateContract_Insights -->> to make the status of the order activated
             
 * Modified by:         10/18/2024
 * Modified Date:
 * Modification purpose:
 * Modified changes:
 ********************************************************************************/

 global class generateContract_Insights implements Database.Batchable<SObject>, Database.Stateful, Schedulable  {

    public final List<Id>  quoteIds;
    global Integer recordsProcessed = 0;


    public generateContract_Insights(){
        System.debug('Default constructor for contracting class executed -->>>> ');
    }

    //Constructor to fire the class explicitly from backend
    public generateContract_Insights(List<Id> quoIds){
            quoteIds = quoIds; 
            System.debug('quoIds for contracting class are -->>>> '+ quoteIds);
    }

    // Start method to query SBQQ__Quote__c records where Is_Processed_Insights__c is not checked
    global Database.QueryLocator start(Database.BatchableContext bc) {

        if (!quoteIds.isEmpty()) {
            // Query for the specific Quote records based on the passed IDs
            String query = 'select id, SBQQ__Contracted__c, SBQQ__Quote__c, Contracted_From_Batch_class_Insights__c, Status from Order where SBQQ__Quote__c in : quoteIds and SBQQ__Contracted__c = false and ActivatedDate = today';
            return Database.getQueryLocator(query);
        } else {
            // If no Quote IDs are passed, run the predefined query
            String query = 'select id, SBQQ__Contracted__c, SBQQ__Quote__c, Contracted_From_Batch_class_Insights__c, Status from Order where SBQQ__Contracted__c = false and SBQQ__Quote__c != null and ActivatedDate = today';
            return Database.getQueryLocator(query);
        }

    }

    global void execute(Database.BatchableContext bc, List<Order> scope) {

        try { 
            // Avoid unnecessary DML if the list is empty
            if (scope != null && !scope.isEmpty()) {
                for (Order ord : scope) {
                    // Process each quote and mark it as ordered
                    ord.Status = 'Activated';
                    // ord.SBQQ__Contracted__c = true; Send it to separate scheduled apex.
                    ord.Contracted_From_Batch_class_Insights__c = true;
                    recordsProcessed = recordsProcessed + 1;
                }
    
                // Use Database.update with allOrNone set to false to allow partial success
                Database.SaveResult[] saveResults = Database.update(scope, false);
    
                // Handle partial failures
                for (Integer i = 0; i < saveResults.size(); i++) {
                    if (!saveResults[i].isSuccess()) {
                        // Log the error or take necessary actions for failed records
                        System.debug('Failed to update Order ID: ' + scope[i].Id + ', Error: ' + saveResults[i].getErrors()[0].getMessage());
                    } else {
                        System.debug('Successfully updated Order ID: ' + scope[i].Id);
                    }
                }
                System.debug('Successfully Ordered --->>>>>>>>>> ' + scope.size() + ' orders.');

                //Delete this class it did not work with even Without sharing parameter !!!!!!!!!!!!!
                // System.enqueueJob(new enableContractedQueueable_Insights(scope));

            } else {
                System.debug('No orders to process in this batch.');
            }


        } catch (DmlException e) {
            // Handle DML errors and log them
            System.debug('Error creating orders:-->>>> ' + e.getMessage());
        } 
    }

    // Finish method to handle post-processing and call another batch class
    global void finish(Database.BatchableContext bc) {
        // Get the ID of the AsyncApexJob representing this batch job
        // AsyncApexJob a = [SELECT Id, Status, NumberOfErrors, JobItemsProcessed,
        //                    TotalJobItems, CreatedBy.Email
        //                    FROM AsyncApexJob WHERE Id = :BC.getJobId()];

        // // Send an email to the Apex job's submitter notifying of job completion
        // Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        // String[] toAddresses = new String[] {a.CreatedBy.Email};
        // mail.setToAddresses(toAddresses);
        // mail.setSubject('ProcessUnprocessedQuotesBatch ' + a.Status);
        // mail.setPlainTextBody('The batch Apex job processed ' + a.TotalJobItems + ' batches with ' + a.NumberOfErrors + ' failures.');
        // Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });

    }

    // Execute method for the Schedulable interface
    global void execute(SchedulableContext sc) {

            Database.executeBatch(new generateContract_Insights(quoteIds), 1);
        
    }

}