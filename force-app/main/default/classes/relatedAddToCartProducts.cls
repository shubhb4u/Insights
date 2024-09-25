public with sharing class relatedAddToCartProducts {

    @AuraEnabled
    public static string getCartandAddNewProducts(String productId, String cartId){
        System.debug('productId:->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ' + productId);
        System.debug('cartId >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>' + cartId);
        try {

            CartDeliveryGroup deliveryGroup = [SELECT Id, CartId FROM CartDeliveryGroup WHERE CartId = :cartId];
            System.debug('CartDeliveryGroup: ' + deliveryGroup);

            List<CartItem> productToAdd = new List<CartItem>();
            Map<Id, CartItem> cartMap = new MAP<Id, CartItem>();
            List<CartItem> cartItemList = [Select Id, Product2Id, Quantity from CartItem where CartId =: cartId];
            for(cartItem ctIt: cartItemList){
                cartMap.put(ctIt.Product2Id, ctIt);
            }
            List<product2> productItems = [SELECT Id, Name, StockKeepingUnit,  Price__c FROM product2 WHERE Id = :productId];
        
            for (Product2 pro : productItems) {
                if(!cartMap.containsKey(pro.Id)){
                    CartItem item = new CartItem();
                    item.Name = pro.Name;
                    item.CartId = cartId;
                    item.CartDeliveryGroupId = deliveryGroup.Id;
                    item.Product2Id = pro.Id;
                    item.SalesPrice = pro.Price__c;
                    item.ListPrice = pro.Price__c;
                    item.Sku = pro.StockKeepingUnit;
                    item.TotalPriceAfterAllAdjustments = pro.Price__c;
                    item.TotalLineAmount = pro.Price__c;
        
                    productToAdd.add(item);
                }
                else{
                    cartItem ct = cartMap.get(pro.Id);
                    ct.Quantity += 1;
                    productToAdd.add(ct);
                }
                
            }
            upsert productToAdd;

            return 'success';
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String createCartAndAddQuoteLinesIntoCart(String productId,string accountId) {
        // Create a new cart
        WebCart cart = new WebCart();
        cart.Name = 'Default_Cart_Name';
        cart.WebStoreId = '0ZEak0000014VMPGA2'; // Replace with the actual store ID
        cart.AccountId = accountId; 
        insert cart;
        System.debug('Web cart created: ' + cart.Id);
    
        // Create a CartDeliveryGroup
        CartDeliveryGroup deliveryGroup = new CartDeliveryGroup();
        deliveryGroup.Name = 'Cart Delivery Group';
        deliveryGroup.CartId = cart.Id;
        insert deliveryGroup;
    
        // Fetch and insert cart items
        List<CartItem> productsToAdd = createCartItemsFromProduct(productId, cart.Id, deliveryGroup.Id);
        if (!productsToAdd.isEmpty()) {
            upsert productsToAdd;
            System.debug('Cart items added: ' + productsToAdd);
        }
        return cart.Id;
    }


    private static List<CartItem> createCartItemsFromProduct(String productId, String cartId, String deliveryGroupId) {
        List<CartItem> productToAdd = new List<CartItem>();
        List<product2> productItems = [SELECT Id, Name, StockKeepingUnit,  Price__c
                                                FROM product2 
                                                WHERE Id = :productId];
        if (!productItems.isEmpty()) {
            for (Product2 pro : productItems) {
                CartItem item = new CartItem();
                item.Name = pro.Name;
                item.CartId = cartId;
                item.CartDeliveryGroupId = deliveryGroupId;
                item.Product2Id = pro.Id;
                item.SalesPrice = pro.Price__c;
                item.ListPrice = pro.Price__c;
                item.Sku = pro.StockKeepingUnit;
                item.TotalPriceAfterAllAdjustments = pro.Price__c;
                item.TotalLineAmount = pro.Price__c;
    
                productToAdd.add(item);
            }
        }

        if(!productItems.isEmpty()){
            insert productToAdd;
            System.debug('cart items added successfully!!');
        }
        
                // item.TotalListPrice = quoteLine.ListPrice;
                // item.TotalPrice = quoteLine.TotalPrice;
                // item.UnitAdjustedPrice = quoteLine.UnitPrice;
                // item.UnitAdjustmentAmount = 0;
                // item.NetUnitPrice = 0;
                // item.GrossUnitPrice = 0;
                //item.Requested_a_quote__c = true;
                //item.Quote_Approved__c = true;
    
    
        return productToAdd;
    }
}