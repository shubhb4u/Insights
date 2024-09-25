trigger PromotionTargetTrigger on PromotionTarget (after insert, after update) {

    if (Trigger.isAfter) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            PromotionTargetHandler.updateProductpercent(Trigger.new);
        }
    }
}