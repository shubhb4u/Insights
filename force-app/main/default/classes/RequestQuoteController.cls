/**
 * @description       : Creates a quote based on the provided cart ID/Product Id on PDP page
 * @author            : Shubham Mazumdar
 * @group             :
 * @last modified on  : 06-28-2024
 * @last modified by  : Shubham Mazumdar
**/
public with sharing class RequestQuoteController {

    //@AuraEnabled
    // public static String createQuote(Id cartId,Date requestQuoteBy, String reasonForQuote,Id contactId,String userName) {
    //     try {
            
    //         system.debug('cartId'+cartId);
    //         system.debug('requestQuoteBy'+requestQuoteBy);
    //         system.debug('reasonForQuote'+reasonForQuote);
    //         if (cartId != null) {
    //             List<CartItem> cartItems = [SELECT Id, Quantity, Product2Id, ListPrice,SalesPrice, TotalAmount, CartId FROM CartItem WHERE CartId = :cartId];
    //             List<Pricebook2> PbId = [SELECT Id,name FROM Pricebook2 WHERE Name = 'MADA Services Price Book' limit 1];
    //             System.debug('cartItems : '+cartItems);

    //             // Create a new Quote record outside the loop
    //             Quote newQuote = new Quote(
    //                 Status = 'Draft',
    //                 Name = userName + ' ' + 'Quote',
    //                 Pricebook2Id =  pbId[0].id,
    //                 Email = 'quotetest@gmail.com',
    //                 ExpirationDate = requestQuoteBy,
    //                 Description = reasonForQuote,
    //                 ContactId =contactId// Set a meaningful name for the quote
    //             );
    //             insert newQuote;
    //             System.debug('newQuote id: '+newQuote.id);


    //             List<QuoteLineItem> quoteLineItems = new List<QuoteLineItem>();
    //             // Iterate through cart items to create quote line items
    //             for (CartItem cartItem : cartItems) {
    //                 system.debug('inside cartitems');
    //                 List<PricebookEntry> pricebookEntry = [SELECT Id, Pricebook2Id FROM PricebookEntry WHERE Product2Id = :cartItem.Product2Id 
	// 				AND Pricebook2Id =: PbId[0].Id];
    //                 // newQuote.Pricebook2Id = pricebookEntry.Pricebook2Id;
    //                 QuoteLineItem quoteLineItem = new QuoteLineItem(
    //                     QuoteId = newQuote.Id,
    //                     //List_Price__c = cartItem.ListPrice,
    //                     Product2Id = cartItem.Product2Id,
    //                     UnitPrice = cartItem.SalesPrice,
    //                     Quantity = cartItem.Quantity,
    //                     PricebookEntryId = pricebookEntry[0].Id
    //                 );
    //                 quoteLineItems.add(quoteLineItem);
    //                 system.debug('quoteLineItems');
    //             }

    //             // update newQuote;
    //             // Insert all quote line items
    //             if (!quoteLineItems.isEmpty()) {
    //                 insert quoteLineItems;
    //             }
    //             return newQuote.Id;

    //         } else {
    //             return 'Error creating quote: cartId is null';
    //         }
    //     } catch (Exception e) {
    //         System.debug('In Exception...' +e.getMessage());
    //         return 'Error creating quote: ' + e.getMessage();
    //     }
    // }


    //For product detail page - ----------------------------------------------------------------------------------------
    @AuraEnabled
    public static Quote createQuoteWithLineItems( String productId, Integer qty, Date requestQuoteBy, String reason, String contactId   ) {


        // Retrieve the User's Contact record
        Contact userContact = [SELECT Id, Name, email, Phone, accountId FROM Contact WHERE Id = :contactId LIMIT 1];
        System.debug('User Contact: ' + userContact);

        // Retrieve AccountId from userContact
        List<Account> accList = [SELECT Id, Name /*PBS_Type__c*/ FROM Account WHERE Id = :userContact.accountId AND isBuyer = true LIMIT 1];
        System.debug('accList: ' + accList);
        
        // Account acc = accList[0];
        // System.debug('account is ->>   '+ acc);

        // Get PriceBookId
        // Id priceBookId = getPriceBookId(acc.PBS_Type__c);
        Id priceBookId = getPriceBookId();
        System.debug('priceBookId is ->>   '+ priceBookId);

        //Get priceBookEntry -  
        priceBookEntry  pbEntry  = getProductPrice(productId, priceBookId);
        System.debug('pbEntry is ->>   '+ pbEntry);

        // Create Opportunity
        // Opportunity opp = createOpp(acc.Id, priceBookId, productId, qty, pbEntry);
        // System.debug('opp is ->>   '+ opp);

        // Create Quote
        Quote quote = createQuote( reason, userContact, requestQuoteBy );
        System.debug('quote is ->>   '+ quote);

       
        //Create Quote Line Items and Opportunity Line Items from Cart
        List<QuoteLineItem> quoteLineItems = createQuoteLineItems( quote.Id, productId, pbEntry,  qty);
        System.debug('quoteLineItems are ->>   '+ quoteLineItems);

        return quote;
    }

    //Retrieve pricebook to be used to select products for Quote line items  -  

    private static Id getPriceBookId() {
        // String pbName = (type == 'Platinum') ? 'Etg B2B DevOrg Price Book' : (type == 'Gold') ? 'Gold' : 'Standard';
        Pricebook2 pb = [SELECT Id,name FROM Pricebook2 WHERE Name = 'Insights B2B Price Book' limit 1];
        return pb.Id;
    }

    // Retrieve the UnitPrice for the specified product
    private static PricebookEntry getProductPrice(String productId, Id priceBookId) {
        
        PricebookEntry pbEntry;
        try {
            // pbEntry = [SELECT id,UnitPrice FROM PricebookEntry WHERE Product2Id = :productId and Pricebook2Id =: priceBookId LIMIT 1];
            List<PricebookEntry> pricebookEntry = [SELECT Id, Pricebook2Id, unitPrice FROM PricebookEntry WHERE Product2Id = :productId 
            AND Pricebook2Id =: priceBookId];
            pbEntry = pricebookEntry[0];
            System.debug(pbEntry);

        } catch (Exception e) {
            System.debug('Error fetching product price: ' + e.getMessage());
        }
    
        return pbEntry;
    }


    // Create a new quote record
    private static Quote createQuote(  String reasonForQuote, Contact userContact, Date requestQuoteBy ) {

        Quote newQuote = new Quote(
                    Status = 'Draft',
                    Name = userContact.name + ' ' + 'Quote',
                    Pricebook2Id =  getPriceBookId(),
                    Email = 'quotetest@gmail.com',
                    ExpirationDate = requestQuoteBy,
                    Description = reasonForQuote,
                    ContactId = userContact.Id // Set a meaningful name for the quote
                );
                insert newQuote;
                System.debug('newQuote id: '+newQuote.id);
                return newQuote;
    }

    // Create quote line items for the specified product and quantity
    private static List<QuoteLineItem> createQuoteLineItems(Id quoteId, String productId,  PricebookEntry pbEntry, Integer qty ) {
        System.debug('Entered quoteLineItem  -->> ');
        List<QuoteLineItem> quoteLineItems = new List<QuoteLineItem>();

        quoteLineItems.add(new QuoteLineItem(
                QuoteId = quoteId,
                PricebookEntryId = pbEntry.Id,
                Product2Id = productId,
                UnitPrice = pbEntry.UnitPrice,
                Quantity = qty
            ));

            if(!quoteLineItems.isEmpty()){
                insert quoteLineItems;
            }
            return quoteLineItems;
    }


}