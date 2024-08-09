public with sharing class FeaturedProductsController {
   
    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> getFeaturedProductsInsights() {
       

        return [
            SELECT 
            Id, 
            Product2Id, 
            Pricebook2Id, 
            UnitPrice, 
            Pricebook2.Name, 
            Product2.Name,
        product2.productCode,
        product2.Featured_Product__c,
        product2.Content_Type__c,
        Product2.Adjustment_Amount__c,
        Product2.AdjustmentPercent__c,
        Product2.Description
        
            
        FROM 
            PricebookEntry 
        WHERE  
            Pricebook2Id = '01sak000004KKRhAAO' AND product2.Featured_Product__c=true
        
    
            
        ];
    }
}