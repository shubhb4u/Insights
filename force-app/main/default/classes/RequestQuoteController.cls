/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 08-13-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public without sharing class RequestQuoteController {

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
public static String createQuote(Id cartId, Date requestQuoteBy, String reasonForQuote, Id contactId, String userName, String userEmail,Id accountId ) {
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

        if (cartId != null) {
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

                QuoteLineItem quoteLineItem = new QuoteLineItem(
                    QuoteId = newQuote.Id,
                    Product2Id = cartItem.Product2Id,
                    Quantity = cartItem.Quantity,
                    UnitPrice = cartItem.TotalAmount,
                    PricebookEntryId = pbEntry.Id
                );

                quoteLineItems.add(quoteLineItem);
                //cartItem.Requested_a_quote__c = true;
            }

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

@AuraEnabled
public static string createOpportunityForQuote( String cartId, String accountId, String accountOwnerId){
    try {

        System.debug('cartId: --->>>' + cartId);
        System.debug('accountId: --->>>>' + accountId);
        System.debug('accountOwnerId: --->>> ' + accountOwnerId);


        if (cartId != null) {
            List<CartItem> cartItems = [SELECT Id, Name, Product2Id, CartId 
                                        FROM CartItem WHERE CartId = :cartId AND Type = 'Product'];
            
            // Retrieve the System Administrator user ID
            // Id systemAdmin = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' LIMIT 1].Id;
            
            Opportunity opp = new Opportunity();
            opp.Name = accountId +' ' + + System.today() + ' opportunity';
            opp.AccountId = accountId;
            opp.CloseDate = System.today() + 30;
            opp.StageName = 'Prospecting';
            opp.Description = getProductNames(cartItems);
            opp.OwnerId = accountOwnerId;

            insert opp;

            return 'Success: Opportunity created with ID ' + opp.Id;
        } else {
            return 'Error creating opportunity: cartId is null';
        }
    } catch (Exception e) {
        throw new AuraHandledException('Error creating opportunity: ' + e.getMessage());
    }
}

public static String getProductNames(List<CartItem> cartItems) {
    String productNames = '';
    if (!cartItems.isEmpty()) {
        for (CartItem cartIt : cartItems) {
            productNames += cartIt.Name + '; ';
        }

        productNames = 'The requested products are-> ' + productNames;
    }
    return productNames;
}
}