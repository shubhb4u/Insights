public class UpdateOrderWithQuoteId_Insights implements Queueable {

    private Map<Id, Id> orderToQuoteMap;
    private List<SBQQ__Quote__c> quoteList;

    // Constructor to pass in the order and quote mappings
    public UpdateOrderWithQuoteId_Insights(Map<Id, Id> orderToQuoteMap, List<SBQQ__Quote__c> quoList) {
        this.orderToQuoteMap = orderToQuoteMap;
        this.quoteList = quoList;
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
        for(SBQQ__Quote__c quo: quoteList){
            try {
                if(quo.SBQQ__Ordered__c == false){
                    quo.SBQQ__Ordered__c = true;
                    quotesToUpdate.add(quo);
                }
            } catch (Exception e) {
                System.debug('Error updating quotes: ' + e.getMessage());
            }
        }

        if (!ordersToUpdate.isEmpty() || !quotesToUpdate.isEmpty()) {
            try {
                // update ordersToUpdate;
                // update quotesToUpdate;
                System.debug('Orders successfully updated with Quote ID');
            } catch (Exception e) {
                System.debug('Error updating orders: ' + e.getMessage());
            }
        }
    }
}