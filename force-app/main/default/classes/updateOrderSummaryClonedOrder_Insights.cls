public with sharing class updateOrderSummaryClonedOrder_Insights {

    private Map<Id, Id> orderMap;
    private List<SBQQ__Quote__c> quoteList;
    Map<Integer, String> orderSummaryMap = new map<Integer,String>();

    public updateOrderSummaryClonedOrder_Insights(Map<Id, Order> orderMap, List<SBQQ__Quote__c> quoList) {

        this.orderMap = orderMap;
        this.quoteList = quoList;

    }

    // Execute method for Queueable interface
    public void execute(QueueableContext context) {

        for(Order ord: orderMap.values()){

            if(ord.OrderNumber != null && ord.OrderReferenceNumber != null){

                orderSummaryMap.put(ord.OrderNumber, ord.OrderReferenceNumber );
            }
        }
        System.debug('orderSummaryMap --->>>  ', orderSummaryMap);


            
    }
}