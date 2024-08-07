public with sharing class FeaturedPro {
    @AuraEnabled(cacheable=true)
    public static List<Product2> getFeaturedRecs() {
        List<Product2> productList = [
            SELECT Id, Name, Description, Price__c, ProductCode, Shipping_Available__c, Featured_Product__c 
            FROM Product2 
            WHERE Featured_Product__c = true
        ];
        System.debug('ProductList: ' + productList);
        return productList;
    }
}