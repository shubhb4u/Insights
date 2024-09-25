trigger ProductMediaTrigger on ProductMedia (after insert, after update) {
    if (Trigger.isAfter) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            ProductMediaTriggerHandler.updateProductContentType(Trigger.new);
        }
    }
}