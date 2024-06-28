/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 04-08-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class IndividualQuoteRecords {
    @AuraEnabled
    public static Quote getQuoteRecord(string quoteId) {
        system.debug('quoteId: '+quoteId);
        Quote quo;
        if(quoteId!=null){
            system.debug('Inside If:');
        quo=[select id,ContactId,QuoteNumber,Subtotal,Discount,GrandTotal,Status,Name,ExpirationDate,TotalPrice from Quote where Id = : quoteId limit 1];
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
    public static String clearCartandAddQuoteLines(string quoteId,string cartId) {
        List<CartItem> CartItems =new List<CartItem>();
        List<CartItem> CartItemsToAdd =new List<CartItem>();
        CartItems =[select id from CartItem where CartId =: cartId];
        System.debug('CartItems size --0>>' + CartItems
        .size());
        CartDeliveryGroup DGId=[select Id,CartId from CartDeliveryGroup where CartId =:cartId];
        System.debug('CartDeliveryGroup size --0>>' + DGId);
        if(CartItems != null){
            delete CartItems;
        }

        List<QuoteLineItem> QuoteLineItems = new List<QuoteLineItem>();
        QuoteLineItems = [select Id ,Product2Id,Product2.Name,Product2.StockKeepingUnit, Quote.Name, QuoteId, UnitPrice,TotalPrice, ListPrice, Discount, Quantity from QuoteLineItem where QuoteId =: quoteId];
        if(QuoteLineItems!=null){
            for(QuoteLineItem quoteline : QuoteLineItems){
                CartItem item = new CartItem();
                item.Name = quoteline.Product2.Name;
                item.CartId = cartId;
                item.CartDeliveryGroupId = DGId.Id;
                item.Product2Id = quoteline.Product2Id;

                item.SalesPrice = quoteline.UnitPrice;
                item.Quantity = quoteline.Quantity;
                item.ListPrice = quoteline.ListPrice;
                item.Sku  =quoteline.Product2.StockKeepingUnit;
                item.AdjustmentAmount = 0;
                item.AdjustmentTaxAmount = 0;
                item.TotalAdjustmentAmount = 0;
                item.TotalPriceAfterAllAdjustments = quoteline.UnitPrice;
                item.TotalLineAmount = quoteline.UnitPrice;
                item.TotalListPrice = quoteline.ListPrice;
                item.TotalPrice = quoteline.TotalPrice;
                item.UnitAdjustedPrice = quoteline.UnitPrice;
                item.UnitAdjustmentAmount = 0;
                item.NetUnitPrice = 0;
                item.GrossUnitPrice = 0;
                CartItemsToAdd.add(item);
            }
            if(CartItemsToAdd!=null){
                insert CartItemsToAdd;
            }
        }
        return cartId;
    }
}