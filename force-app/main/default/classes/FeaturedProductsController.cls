public without sharing class FeaturedProductsController {
   
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