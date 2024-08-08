public with sharing class PromotionTargetHandler {
    
    public static void updateProductpercent(List<PromotionTarget > proTarList){
        // Create a map to hold Product2 Ids and their corresponding Content_Type__c value
        Map<Id, Decimal> productPercentMap = new Map<Id, Decimal>();
        Map<Id, Decimal> productAmountMap = new Map<Id, Decimal>();
        Set<Id> productIds = new Set<id>();

        // Iterate over the list of ProductMedia records
        if(proTarList.isEmpty()){
            for (PromotionTarget proTar : proTarList) {
                // Get the Product2 Id from the ProductMedia record
                Id productId = proTar.TargetId;
                productIds.add(proTar.TargetId);
    
                // Determine the content type based on your logic
                // Here, we assume the content type can be derived from a field on ProductMedia, adjust as necessary
                Decimal AdjustmentPercent = proTar.AdjustmentPercent;
                Decimal  AdjustmentAmount = protar.AdjustmentAmount;
    
                // Update the map with the new content type
                if(AdjustmentPercent != 0){
                    productPercentMap.put(productId, AdjustmentPercent);
                }
                if(AdjustmentAmount != 0){
                    productAmountMap.put(productId, AdjustmentAmount);
                }
                
            }
        }
        

        // Get the existing Product2 records to update
        List<Product2> productsToUpdate = new List<Product2>();
        if(!productIds.isEmpty()){
            productsToUpdate = [SELECT Id, Adjustment_Amount__c,AdjustmentPercent__c FROM Product2 WHERE 
                                                Id IN : productIds];
        }
        
    
        //List to upddate products -  
        List<Product2> updateProductPromotionAmounts = new List<product2>();                                      

        // Update the Content_Type__c field
        for (Product2 product : productsToUpdate) {

            if(productPercentMap.containsKey(product.Id) && productPercentMap.get(product.Id) != product.AdjustmentPercent__c){
                product.AdjustmentPercent__c = productPercentMap.get(product.Id);
            }else if(productAmountMap.containsKey(product.Id) && productAmountMap.get(product.Id) != product.Adjustment_Amount__c){
                product.Adjustment_Amount__c = productAmountMap.get(product.Id);
            }else{
                product.Adjustment_Amount__c = 0;
                product.AdjustmentPercent__c = 0;
            }
            updateProductPromotionAmounts.add(product);
            
        }

        // Perform the update
        if (!updateProductPromotionAmounts.isEmpty()) {
            upsert updateProductPromotionAmounts;
        }
    }
}