/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 07-08-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class DisplayProductRecords {
    @AuraEnabled(cacheable=true)
    public static List<product2> getProductRecs() {
        List<product2 > ProductList = [select id, Name, description, price__c, productCode, Shipping_Available__c, Content_Type__c from product2 where ProductCode like 'FR%'];
        System.debug('ProductList:' + ProductList);
        return ProductList;
    }

    public static List<product2> getFeaturedRecs() {
        List<product2 > ProductList = [select id, Name, description, price__c, productCode, Shipping_Available__c, Content_Type__c ,	Featured_Product__c from product2 where ProductCode like 'FR%'];
        System.debug('ProductList:' + ProductList);
        return ProductList;
    }
}