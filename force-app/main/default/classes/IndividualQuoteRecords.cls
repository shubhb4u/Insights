/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 07-23-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class IndividualQuoteRecords {
    @AuraEnabled
    public static Quote getQuoteRecord(string quoteId) {
        system.debug('quoteId: '+quoteId);
        Quote quo;
        if(quoteId!=null){
            system.debug('Inside If:');
        quo=[select id,ContactId,QuoteNumber, description,Subtotal,Discount,GrandTotal,Status,Name,ExpirationDate,TotalPrice from Quote where Id = : quoteId limit 1];
        System.debug('qLidt:'+quo);
        }
        return quo;
    }
    @AuraEnabled
    public static string acceptQuoteRecord(string quoteId) {
        system.debug('quoteId: '+quoteId);
        Quote quo;
        if(quoteId!=null){
            system.debug('Inside If:');
        quo=[select id,ContactId,Status,Name,ExpirationDate,TotalPrice from Quote where Id = : quoteId limit 1];
        if(quo.ExpirationDate!=null && System.today()<=quo.ExpirationDate && quo.Status=='Approved'){
            quo.Status = 'Accepted';
            update quo;
            System.debug('qLidt:'+quo);
        }else if(quo.ExpirationDate!=null && System.today()>quo.ExpirationDate){
            return 'expired';
        }else if(quo.Status!='Approved'){
            return 'not approved';
        }
        }
        if(quo.status == 'Accepted' ){
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