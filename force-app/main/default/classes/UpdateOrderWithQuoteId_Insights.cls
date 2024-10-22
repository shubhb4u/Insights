/*********************************************************************************
 * Created By:          Shubham Mazumdar
 * Created Date:        10/18/2024
 * Purpose:             UpdateOrderWithQuoteId_Insights ->> Calling queueable apex to update the order with the Quote created in this class
                        UpdateOrderItemsWithQuoteLine_Insights -->> To update order item records with their corresponding parent quote line for Contract generation
             
 * Modified by:         10/18/2024
 * Modified Date:
 * Modification purpose:
 * Modified changes:
 ********************************************************************************/


public class UpdateOrderWithQuoteId_Insights implements Queueable {
    
    private Map<Id, Id> orderToQuoteMap;
    private Map<Id, Order> OrderMap;
    
    // Constructor to pass in the order and quote mappings
    public UpdateOrderWithQuoteId_Insights(Map<Id, Id> orderToQuoteMap,  Map<Id, Order> orderMap) {
        this.orderToQuoteMap = orderToQuoteMap;
        this.OrderMap = orderMap;
    }
    // Execute method for Queueable interface
    public void execute(QueueableContext context) {
        List<Order> ordersToUpdate = new List<Order>();
        
        //Either update the parent quote id of the orders or 
        for (Id orderId : orderToQuoteMap.keySet()) {
            Order ord = new Order();
            ord.Id = orderId;
            ord.SBQQ__Quote__c = orderToQuoteMap.get(orderId); 
            ordersToUpdate.add(ord);
        }
        
        
        if (!ordersToUpdate.isEmpty() ) {
            try {
                update ordersToUpdate;
                System.debug('Orders successfully updated with Quote ID');
            } catch (Exception e) {
                System.debug('Error updating orders: ' + e.getMessage());
            }
        }
        
        // Retrieve orders and populate orderMap1
        Map<Id, Order> orderMap1 = new Map<Id, Order>(
            [SELECT Id, Name, AccountId, SBQQ__Quote__c,(SELECT Id, OrderId, Product2Id, ProductSellingModelId, QuoteLineItemId
             FROM OrderItems) 
             FROM Order WHERE Id IN :OrderMap.keySet()]
        );
        
        System.debug('OrderMap1: ' + orderMap1);
        
        System.enqueueJob(new UpdateOrderItemsWithQuoteLine_Insights(OrderMap1));
    }
}