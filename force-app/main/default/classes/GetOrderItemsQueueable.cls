public class GetOrderItemsQueueable implements Queueable, Database.AllowsCallouts {
    private Set<Id> orderIds;

    public GetOrderItemsQueueable(Set<Id> orderIds) {
        this.orderIds = orderIds;
    }

    public void execute(QueueableContext context) {
        try {
            // Query OrderItems for the given Order IDs
            List<OrderItem> orderitemList = [SELECT Id, OrderId, PricebookEntryId, Quantity, Product2Id, Product2.Description, UnitPrice 
                                             FROM OrderItem 
                                             WHERE OrderId IN :orderIds 
                                             AND Product2.ProductCode != null];

            // Debug or process the result asynchronously
            System.debug('Fetched OrderItems asynchronously -->> ' + orderitemList);

            // Process the order items here or pass them to another asynchronous job
            // Optionally, you could chain another queueable here if needed
        } catch (Exception e) {
            System.debug('Error getting orderItems: ' + e.getMessage());
        }
    }
}