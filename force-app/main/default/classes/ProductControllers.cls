public with sharing class ProductControllers {
    @AuraEnabled(cacheable=true)
    public static List<Product2> getAvailableProducts() {
        return [SELECT Id, Name, ProductCode, Description FROM Product2 WHERE Promoted_Product__c=true LIMIT 1];
    }
}