/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 08-08-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class DisplayProductRecords {
    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> getProductRecs() {
        List<PricebookEntry> productList = [
            SELECT Id, Product2.Name, Product2.ProductCode, Product2.Content_Type__c,Product2.Description, UnitPrice, Pricebook2.Name
            FROM PricebookEntry
            WHERE Pricebook2.Name = 'Insights B2B Price Book' 
              AND Product2.ProductCode LIKE 'FR%'
        ];
        System.debug('ProductList:' + productList);
        return productList;
    }
}