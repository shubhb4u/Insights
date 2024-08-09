/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 08-08-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public without sharing class DisplayProductRecords {
    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> getProductRecs() {
        List<PricebookEntry> productList = [
            SELECT Id, Product2.Name, Product2.ProductCode, Product2.Content_Type__c,Product2.Description, UnitPrice, Pricebook2.Name, Product2.isDiscounted__c, Product2.isDiscountedAmount__c,
            product2.Adjustment_Amount__c, product2.AdjustmentPercent__c
            FROM PricebookEntry
            WHERE Pricebook2.Name = 'Insights B2B Price Book' 
              AND Product2.ProductCode LIKE 'FR%'
        ];
        System.debug('ProductList:' + productList);
        return productList;
    }


    @AuraEnabled(cacheable=true)
    public static List<product2> getProductRecsForDiscount() {
        List<product2> productListforDiscount = [
            SELECT Id, Name, isDiscounted__c,isDiscountedAmount__c,Adjustment_Amount__c, AdjustmentPercent__c
            FROM product2
            WHERE  Product2.ProductCode LIKE 'FR%' AND (isDiscounted__c = true OR isDiscountedAmount__c = true)
        ];
        System.debug('ProductList for Discount:' + productListforDiscount);
        return productListforDiscount;
    }
}