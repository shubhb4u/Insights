public without sharing class IndividualCPQRecords {
    

    //For CPQ Quote records - 
    @AuraEnabled
    public static SBQQ__Quote__c getCPQQuoteRecord(string quoteId) {
        system.debug('quoteId: ->>> '+quoteId);
        SBQQ__Quote__c quo;
        if(quoteId!=null){
            system.debug('Inside CPQ getrecords If: ->>>');
        quo=[select id,SBQQ__PrimaryContact__c,Name,SBQQ__ListAmount__c,SBQQ__AdditionalDiscountAmount__c,SBQQ__NetAmount__c,SBQQ__Status__c,SBQQ__ExpirationDate__c from SBQQ__Quote__c  where Id = : quoteId limit 1];
        System.debug('qLidt:'+quo);
        }
        return quo;
    }

    //For accepting CPQ quote records - 
    @AuraEnabled
    public static string acceptCPQQuoteRecord(string quoteId) {
        system.debug('quoteId: --->>> '+quoteId);
        SBQQ__Quote__c quo;

        if(quoteId!=null){
            quo=[select id,SBQQ__PrimaryContact__c,SBQQ__Status__c,Name,SBQQ__ExpirationDate__c,SBQQ__NetAmount__c from SBQQ__Quote__c where Id = : quoteId limit 1];
            if(quo.SBQQ__ExpirationDate__c!=null && System.today()<=quo.SBQQ__ExpirationDate__c && quo.SBQQ__Status__c=='Approved'){
                quo.SBQQ__Status__c = 'Accepted';
                update quo;
                System.debug('qLidt: for GPQ records --->>> '+quo);
            }else if(quo.SBQQ__ExpirationDate__c!=null && System.today()>quo.SBQQ__ExpirationDate__c){
                return 'expired';
            }else if(quo.SBQQ__Status__c!='Approved'){
                return 'not approved';
            }
        }
        if(quo.SBQQ__Status__c == 'Accepted' ){
            return 'success';
        }
        else{
            return 'failed';
        }
    }

    @AuraEnabled
    public static String clearCartandAddQuoteLines(String quoteId, String cartId) {
        List<CartItem> cartItems = [SELECT Id FROM CartItem WHERE CartId = :cartId];
        System.debug('CartItems size: ' + cartItems.size());
    
        CartDeliveryGroup deliveryGroup = [SELECT Id, CartId FROM CartDeliveryGroup WHERE CartId = :cartId];
        System.debug('CartDeliveryGroup: ' + deliveryGroup);
    
        if (!cartItems.isEmpty()) {
            delete cartItems;
        }
    
        List<CartItem> cartItemsToAdd = createCartItemsFromQuoteLines(quoteId, cartId, deliveryGroup.Id);
        if (!cartItemsToAdd.isEmpty()) {
            insert cartItemsToAdd;
        }
    
        WebCart cart = [SELECT Id, Status FROM WebCart WHERE Id = :cartId];
        cart.Status = 'Active';
        update cart;
    
        return cartId;
    }



    @AuraEnabled
    public static String createCartAndAddQuoteLinesIntoCart(String quoteId,string accountId) {
        // Create a new cart
        WebCart cart = new WebCart();
        cart.Name = 'Default_Cart_Name ' + quoteId;
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
        List<CartItem> cartItemsToAdd = createCartItemsFromQuoteLines(quoteId, cart.Id, deliveryGroup.Id);
        if (!cartItemsToAdd.isEmpty()) {
            insert cartItemsToAdd;
            System.debug('Cart items added: ' + cartItemsToAdd);
        }
        return cart.Id;
    }


    private static List<CartItem> createCartItemsFromQuoteLines(String quoteId, String cartId, String deliveryGroupId) {
        List<CartItem> cartItemsToAdd = new List<CartItem>();
        List<QuoteLineItem> quoteLineItems = [SELECT Id, Product2Id, Product2.Name, Product2.StockKeepingUnit, Quote.Name, QuoteId, UnitPrice, TotalPrice, ListPrice, Discount, Quantity 
                                                FROM QuoteLineItem 
                                                WHERE QuoteId = :quoteId];
        if (!quoteLineItems.isEmpty()) {
            for (QuoteLineItem quoteLine : quoteLineItems) {
                CartItem item = new CartItem();
                item.Name = quoteLine.Product2.Name;
                item.CartId = cartId;
                item.CartDeliveryGroupId = deliveryGroupId;
                item.Product2Id = quoteLine.Product2Id;
                item.SalesPrice = quoteLine.UnitPrice;
                item.Quantity = quoteLine.Quantity;
                item.ListPrice = quoteLine.ListPrice;
                item.Sku = quoteLine.Product2.StockKeepingUnit;
                item.AdjustmentAmount = 0;
                item.AdjustmentTaxAmount = 0;
                item.TotalAdjustmentAmount = 0;
                item.TotalPriceAfterAllAdjustments = quoteLine.TotalPrice;
                item.TotalLineAmount = quoteLine.TotalPrice;
                item.TotalListPrice = quoteLine.ListPrice;
                item.TotalPrice = quoteLine.TotalPrice;
                item.UnitAdjustedPrice = quoteLine.UnitPrice;
                item.UnitAdjustmentAmount = 0;
                item.NetUnitPrice = 0;
                item.GrossUnitPrice = 0;
                //item.Requested_a_quote__c = true;
                //item.Quote_Approved__c = true;
    
                cartItemsToAdd.add(item);
            }
        }
    
        return cartItemsToAdd;
    }

}