public class UpdateOrderItemsWithQuoteLine_Insights implements Queueable {

    private Map<Id, Order> orderMap;
    private List<Id> recordIds = new List<Id>(); // Initialize the list here

    // Constructor to pass the orderMap to the queueable class
    public UpdateOrderItemsWithQuoteLine_Insights(Map<Id, Order> orderMap) {
        this.orderMap = orderMap;
    }

    public void execute(QueueableContext context) {
        try {
            // Collect all Quote IDs from the passed Orders
            List<Id> quoteIds = new List<Id>();
            for (Order ord : orderMap.values()) {
                system.debug('orderMap.values()' + orderMap.values());
                system.debug('ord QuoteId' + ord.SBQQ__Quote__c);
                if (ord.SBQQ__Quote__c != null) {
                    quoteIds.add(ord.SBQQ__Quote__c);
                    recordIds.add(ord.SBQQ__Quote__c);
                }
            }
            system.debug('orderMap Order and OrderItems' + orderMap);
            system.debug('quoteIds' + quoteIds);

            if (!quoteIds.isEmpty()) {
                // Query the QuoteLines related to the Quotes
                Map<Id, List<SBQQ__QuoteLine__c>> quoteLineMap = new Map<Id, List<SBQQ__QuoteLine__c>>();
                for (SBQQ__QuoteLine__c ql : [
                    SELECT Id, SBQQ__Quote__c, SBQQ__Product__c 
                    FROM SBQQ__QuoteLine__c 
                    WHERE SBQQ__Quote__c IN :quoteIds
                ]) {
                    if (!quoteLineMap.containsKey(ql.SBQQ__Quote__c)) {
                        quoteLineMap.put(ql.SBQQ__Quote__c, new List<SBQQ__QuoteLine__c>());
                    }
                    quoteLineMap.get(ql.SBQQ__Quote__c).add(ql);
                }

                System.debug('quoteLineMap.---->>>>>>>>>>>>>>>>>>>>>>>>>>>> ' + quoteLineMap);

                // List to store Order Items that need to be updated
                List<OrderItem> orderItemsToUpdate = new List<OrderItem>();

                // Match Order Items to Quote Lines by Product2Id
                for (Order ord : orderMap.values()) {
                    List<SBQQ__QuoteLine__c> relatedQuoteLines = quoteLineMap.get(ord.SBQQ__Quote__c);
                    if (relatedQuoteLines != null) {
                        for (OrderItem item : ord.OrderItems) {
                            for (SBQQ__QuoteLine__c quoteLine : relatedQuoteLines) {
                                if (quoteLine.SBQQ__Product__c == item.Product2Id && item.ProductSellingModelId != null) {
                                    // Update the OrderItem with the corresponding QuoteLine ID
                                    item.SBQQ__QuoteLine__c = quoteLine.Id;
                                    orderItemsToUpdate.add(item);
                                }
                            }
                        }
                    }
                }
                system.debug('orderItemsToUpdate' + orderItemsToUpdate);

                // Perform the update
                if (!orderItemsToUpdate.isEmpty()) {
                    update orderItemsToUpdate;

                    // Schedule the generateContract_Insights batch to run 5 minutes later
                    if (!recordIds.isEmpty()) {
                        System.debug('Passing successfully processed Quote IDs to the next batch:---->>>>>>>> ' + recordIds);
                        Database.executeBatch(new generateContract_Insights(recordIds), 1); 
                    }
                }
            }

        } catch (Exception e) {
            System.debug('Error in UpdateOrderItemsWithQuoteLineId: ' + e.getMessage());
        }
    }
}