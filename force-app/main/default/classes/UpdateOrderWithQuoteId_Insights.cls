public class UpdateOrderWithQuoteId_Insights implements Queueable {
    
    private Map<Id, Id> orderToQuoteMap;
    private List<SBQQ__Quote__c> quoteList;
    private Map<Id, Order> OrderMap;
    
    // Constructor to pass in the order and quote mappings
    public UpdateOrderWithQuoteId_Insights(Map<Id, Id> orderToQuoteMap, List<SBQQ__Quote__c> quoList, Map<Id, Order> orderMap) {
        this.orderToQuoteMap = orderToQuoteMap;
        this.quoteList = quoList;
        this.OrderMap = orderMap;
    }
    // Execute method for Queueable interface
    public void execute(QueueableContext context) {
        List<Order> ordersToUpdate = new List<Order>();
        List<SBQQ__Quote__c> quotesToUpdate = new List<SBQQ__Quote__c>();
        
        //Either update the parent quote id of the orders or 
        for (Id orderId : orderToQuoteMap.keySet()) {
            Order ord = new Order();
            ord.Id = orderId;
            ord.SBQQ__Quote__c = orderToQuoteMap.get(orderId); 
            ordersToUpdate.add(ord);
        }
        
        //Generate new order and link it to quote from CPQ automation - this will create duplicate records.
        // for(SBQQ__Quote__c quo: quoteList){
        //     try {
        //         if(quo.SBQQ__Ordered__c == false){
        //             quo.SBQQ__Ordered__c = true;
        //             quotesToUpdate.add(quo);
        //         }
        //     } catch (Exception e) {
        //         System.debug('Error updating quotes: ' + e.getMessage());
        //     }
        // }
        
        if (!ordersToUpdate.isEmpty() || !quotesToUpdate.isEmpty()) {
            try {
                update ordersToUpdate;
                // update quotesToUpdate;
                System.debug('Orders successfully updated with Quote ID');
            } catch (Exception e) {
                System.debug('Error updating orders: ' + e.getMessage());
            }
        }
        
        Map<Id, Order> newOrderMap = new Map<Id, Order>();
        
        // Loop through the orderToQuoteMap to get the OrderId and corresponding QuoteId
        for (Id orderId : orderToQuoteMap.keySet()) {
            // Retrieve the corresponding Order object from the orderMap
            Order ord = orderMap.get(orderId);
            
            // Check if the order exists in the orderMap
            if (ord != null) {
                // Print the SBQQ__Quote__c field value to see if it's populated
                System.debug('Order ID: ' + orderId + ', SBQQ__Quote__c: ' + ord.SBQQ__Quote__c);
                
                // Add the OrderId and Order to the newOrderMap
                newOrderMap.put(orderId, ord);
            } else {
                System.debug('Order not found for Order ID: ' + orderId);
            }
        }
        
        // Retrieve orders and populate orderMap1
        Map<Id, Order> orderMap1 = new Map<Id, Order>(
            [SELECT Id, Name, AccountId, SBQQ__Quote__c,(SELECT Id, OrderId, Product2Id, ProductSellingModelId, QuoteLineItemId
             FROM OrderItems) 
             FROM Order WHERE Id IN :newOrderMap.keySet()]
        );
        
        System.debug('OrderMap1: ' + orderMap1);
        
        for (Id orderId : orderMap1.keySet()) {
            Order ord = orderMap1.get(orderId);
            System.debug('Order ID: ' + orderId + ', SBQQ__Quote__c: ' + ord.SBQQ__Quote__c);
        }
        
        System.enqueueJob(new UpdateOrderItemsWithQuoteLine_Insights(OrderMap1));
    }
}