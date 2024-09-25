/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 08-12-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class FeaturedProductsController {
   
    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> getProductRecs() {
        return [
            SELECT 
                Id, 
                Product2Id, 
                Pricebook2Id, 
                UnitPrice, 
                Pricebook2.Name, 
                Product2.Name,
                Product2.ProductCode,
                Product2.Featured_Product__c,
                Product2.Content_Type__c,
                Product2.Adjustment_Amount__c,
                Product2.AdjustmentPercent__c,
                Product2.Description,
                Product2.isDiscounted__c, 
                Product2.isDiscountedAmount__c
            FROM 
                PricebookEntry 
            WHERE  
                Pricebook2Id = '01sak000004KKRhAAO' 
                AND Product2.Featured_Product__c = true
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductRecsForDiscount() {
        return [
            SELECT 
                Id, 
                Name, 
                isDiscounted__c,
                isDiscountedAmount__c,
                Adjustment_Amount__c, 
                AdjustmentPercent__c
            FROM 
                Product2
            WHERE  
                ProductCode LIKE 'FR%' 
                AND (isDiscounted__c = true OR isDiscountedAmount__c = true)
        ];
    }
}