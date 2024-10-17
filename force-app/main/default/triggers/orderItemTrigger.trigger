trigger orderItemTrigger on OrderItem (after insert, before insert) {
    if (Trigger.isBefore) {
        if (Trigger.isInsert) {
           orderItemsHandler_Insights.updateSubscriptionProductsInBeforeTrigger(Trigger.New);
        }
    }

    if (Trigger.isAfter) {
        if (Trigger.isInsert) {
            orderItemsHandler_Insights.createQuotefromOrder(Trigger.New);
           // orderItemsHandler_Insights.updateSubscriptionfields(Trigger.New);
        }
    }
}