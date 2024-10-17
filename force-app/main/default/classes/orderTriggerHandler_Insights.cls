public with sharing class orderTriggerHandler_Insights {
    

    public static void updateOrderSummary(List<Order> orderList){

        Set<Id> quoteIds = new Set<id>();
        if(!orderList.isEmpty()){

            for(Order ord: orderList){

                if(ord.SBQQ__Quote__c != null && ord.OrderReferenceNumber = null){
                    quoteIds.add(ord.SBQQ__Quote__c);
                }
            }
        }

        System.debug('quoteIds are -->> '+ quoteIds);

        if(!quoteIds.isEmpty()){
            Map<Id, SBQQ__Quote__c> quoteMap = new map<Id, SBQQ__Quote__c>([Select id, Order_Number_Insights__c, 
                                                                        (Select id, orderNumber, OrderReferenceNumber from  orders) 
                                                                        from SBQQ__Quote__c where id in: quoteIds]);


            Map<Id, orderSummary> orderSummaryMap = new Map<Id, orderSummary>();
            for(SBQQ__Quote__c quo: quoteMap.values().orders){

            }

        }
        
    }
}