trigger orderItemTrigger on orderItem (after insert) {

    if(Trigger.isAfter){
        if(Trigger.isInsert){
            orderItemsHandler_Insights.createQuotefromOrder(Trigger.New);
        }
    }

}