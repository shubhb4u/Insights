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
        List<PricebookEntry> productList = [
            SELECT Id, Product2Id, Product2.Name, Product2.ProductCode, Product2.Content_Type__c, Product2.Description, 
                   UnitPrice, Pricebook2.Name, Product2.isDiscounted__c, Product2.isDiscountedAmount__c,
                   Product2.Adjustment_Amount__c, Product2.AdjustmentPercent__c
            FROM PricebookEntry
            WHERE Pricebook2.Name = 'Insights B2B Price Book' 
            AND Product2.ProductCode LIKE 'FR%'
            AND Product2.Featured_Product__c = true
        ];

        // Optionally combine the productList with discountProducts for UI consumption if needed
        System.debug('ProductList: ' + productList);
        return productList;
    }

    // Fetch discounted products and calculate their final prices
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductRecsForDiscount() {
        
        try {
            List<Product2> productListForDiscount;

            // Create a Map to store Product2Id and UnitPrice from PricebookEntry
            Map<Id, Decimal> priceMap = new Map<Id, Decimal>();
            
            List<PricebookEntry> productList = [
                SELECT Id, Product2Id, Product2.Name, Product2.ProductCode, Product2.Content_Type__c, Product2.Description, 
                    UnitPrice, Pricebook2.Name, Product2.isDiscounted__c, Product2.isDiscountedAmount__c,
                    Product2.Adjustment_Amount__c, Product2.AdjustmentPercent__c
                FROM PricebookEntry
                WHERE Pricebook2.Name = 'Insights B2B Price Book' 
                AND Product2.ProductCode LIKE 'FR%'
            ];

            // Populate the priceMap with Product2Id and UnitPrice from the query result
            for (PricebookEntry pr : productList) {
                if (!priceMap.containsKey(pr.Product2Id)) {
                    priceMap.put(pr.Product2Id, pr.UnitPrice);
                }
            }

            productListForDiscount = [
                SELECT Id, Name, isDiscounted__c, isDiscountedAmount__c, Adjustment_Amount__c, 
                       AdjustmentPercent__c, Final_price_Insights__c
                FROM Product2
                WHERE ProductCode LIKE 'FR%' 
                  AND (isDiscounted__c = true OR isDiscountedAmount__c = true)
            ];

            // Calculate the final price for each discounted product
            for (Product2 prod : productListForDiscount) {
                if (priceMap.containsKey(prod.Id)) {
                    prod.Final_price_Insights__c = calculateDiscount(prod, priceMap);
                } else {
                    System.debug('Product not found in priceMap: ' + prod.Id);
                }
            }

            System.debug('ProductList for Discount: ' + productListForDiscount);
            return productListForDiscount;

        } catch (Exception e) {
            System.debug('Error retrieving discounted products: ' + e.getMessage());
            return new List<Product2>(); // Return an empty list in case of an error
        }
        
    }

    // Method to calculate the final price based on discount
    public static Decimal calculateDiscount(Product2 product, Map<Id, Decimal> priceMap) {
        Decimal finalPrice = priceMap.get(product.Id);

        if (product.isDiscounted__c) {
            finalPrice -= (product.AdjustmentPercent__c / 100) * finalPrice;
        } else if (product.isDiscountedAmount__c && product.Adjustment_Amount__c != null) {
            finalPrice -= product.Adjustment_Amount__c;
        }

        return finalPrice;
    }
}