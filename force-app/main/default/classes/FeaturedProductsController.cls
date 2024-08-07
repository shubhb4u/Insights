public with sharing class FeaturedProductsController {
   
    @AuraEnabled(cacheable=true)
    public static List<Product2> getFeaturedProductsInsights() {
       

        return [
            SELECT Id, Name, Description, Featured_Product__c ,Shipping_Available__c ,productCode, price__c
            FROM Product2 
            WHERE ProductCode LIKE 'FR%' 
            AND Featured_Product__c = true
            
        ];
    }
}