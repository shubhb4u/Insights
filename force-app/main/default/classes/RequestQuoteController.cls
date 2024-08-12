/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 07-23-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class RequestQuoteController {

    // Retrieve the UnitPrice for the specified product
    private static PricebookEntry getProductPrice(String productId, Id priceBookId) {
        PricebookEntry pbEntry;
        try {
            pbEntry = [SELECT id, UnitPrice FROM PricebookEntry WHERE Product2Id = :productId AND Pricebook2Id = :priceBookId LIMIT 1];
            System.debug(pbEntry);
    
        } catch (Exception e) {
            System.debug('Error fetching product price: ' + e.getMessage());
        }
        return pbEntry;
    }
    
    @AuraEnabled
    public static String createQuote(Id cartId, Date requestQuoteBy, String reasonForQuote, Id contactId, String userName, String userEmail,Id accountId, Decimal cartGrandTotal ) {
        try {
            List<QuoteLineItem> quoteLineItems = new List<QuoteLineItem>();
            List<CartItem> cartItems = new List<CartItem>();
            List<Pricebook2> pbList = [SELECT Id, Name FROM Pricebook2 WHERE Name = 'Insights B2B Price Book' LIMIT 1];
            Id priceBookId = pbList[0].Id;
    
            System.debug('cartId: ' + cartId);
            System.debug('requestQuoteBy: ' + requestQuoteBy);
            System.debug('reasonForQuote: ' + reasonForQuote);
            System.debug('userName: ' + userName);
            System.debug('userEmail: ' + userEmail);
            System.debug('cartGrandTotal: ' + cartGrandTotal);
    
            if (cartId != null) {

                Map<Id,PromotionTarget> promotionMap = new Map<Id, PromotionTarget>();
                List<PromotionTarget> promoList = [select id,AdjustmentAmount, AdjustmentPercent, AdjustmentType, TargetId from PromotionTarget ];
                if(!promoList.isEmpty()){
                    for(PromotionTarget pro: promoList){
                        promotionMap.put(pro.TargetId, pro );
                    }
                    System.debug('promotionMap  is ->>> '+ promotionMap);
                }


                cartItems = [SELECT Id,Name,Quantity, Product2Id,Product2.StockKeepingUnit, ListPrice, SalesPrice, TotalAmount, CartId FROM CartItem WHERE CartId = :cartId AND Type ='Product'];
    
                // Create a new Quote record
                Quote newQuote = new Quote(
                    Status = 'Draft',
                    Name = userName + ' Quote',
                    Pricebook2Id = priceBookId,
                    Email = userEmail,
                    ExpirationDate = requestQuoteBy,
                    Description = reasonForQuote,
                    ContactId = contactId,
                    QuoteAccountId = accountId
                );
                insert newQuote;
                System.debug('newQuote id: ' + newQuote.Id);
    
                // Iterate through cart items to create quote line items
                for (CartItem cartItem : cartItems) {
                    System.debug('Processing cart item: ' + cartItem.Id);
    
                    PricebookEntry pbEntry = getProductPrice(cartItem.Product2Id, priceBookId);
                    System.debug('PricebookEntry: ' + pbEntry);

                    if(promotionMap.containsKey(cartItem.Product2Id) && promotionMap.get(cartItem.Product2Id).AdjustmentType != null){

                        QuoteLineItem quoteL = new QuoteLineItem();
                        quoteL.QuoteId = newQuote.Id;
                        quoteL.Product2Id = cartItem.Product2Id;
                        quoteL.Quantity = cartItem.Quantity;
                        quoteL.PricebookEntryId = pbEntry.Id;
                        if(promotionMap.get(cartItem.Product2Id).AdjustmentType == 'FixedAmountOffUnitPrice'){
                            quoteL.UnitPrice = cartItem.SalesPrice - promotionMap.get(cartItem.Product2Id).AdjustmentAmount;
                        }else{
                            quoteL.UnitPrice = cartItem.SalesPrice - ((promotionMap.get(cartItem.Product2Id).AdjustmentPercent/100)*cartItem.SalesPrice);
                        }
                        
    
                    quoteLineItems.add(quoteL);
                    }
                    else{
                        QuoteLineItem quoteLineItem = new QuoteLineItem(
                        QuoteId = newQuote.Id,
                        Product2Id = cartItem.Product2Id,
                        Quantity = cartItem.Quantity,
                        UnitPrice = cartItem.SalesPrice,
                        PricebookEntryId = pbEntry.Id
                    );
    
                        quoteLineItems.add(quoteLineItem);

                    }
    
                }

                // Quote qo = [Select id, TotalPrice from Webcart where id =: newQuote.Id limit 1];
                // if(qo.TotalPrice != cartGrandTotal){
                //     qo.TotalPrice = cartGrandTotal;
                //     update qo;
                //     System.debug('Quote price updated because of discounts !!');
                // }
    
                if (!cartItems.isEmpty()) {
                    update cartItems;
                }
    
                if (!quoteLineItems.isEmpty()) {
                    insert quoteLineItems;
                }
    
                return newQuote.Id;
            } else {
                return 'Error creating quote: cartId is null';
            }
        } catch (Exception e) {
            System.debug('Error creating quote: ' + e.getMessage());
            return 'Error creating quote: ' + e.getMessage();
        }
    }

    }