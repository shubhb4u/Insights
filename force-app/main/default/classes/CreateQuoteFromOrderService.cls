public without sharing class CreateQuoteFromOrderService {


    // Main method that creates a quote and quote lines from the given order
    public static void createQuoteAndQuoteLines(List<Order> orderList) {

        try {
            Set<Id> orderIds = new Set<Id>();
            if (!orderList.isEmpty()) {
                for (Order ord : orderList) {
                    orderIds.add(ord.Id);  
                }
                System.debug('Order Ids are -->> ' + orderIds);
            }

            List<OrderItem> ordItem = [select Id, PricebookEntryId, Quantity, Product2Id,  UnitPrice FROM OrderItem where  product2.productcode != null ];
            System.debug('ordItem are -->> ' + ordItem);

            if (!orderIds.isEmpty()) {
                // Query Orders and related Order Items (assuming these are required for Quote Lines)
                Map<Id,Order> orderMap = new Map<Id, Order>([
                    SELECT Id, Name, AccountId, EffectiveDate, Status, TotalAmount, PoNumber, 
                           OrderReferenceNumber, SBQQ__Contracted__c, OrderNumber, ContractId, Account.BillingAddress, 
                           Account.BillingCity, Account.BillingCountry, Account.BillingState, Type,
                           (SELECT Id, orderId, PricebookEntryId, Quantity, Product2Id, Product2.Description, UnitPrice FROM OrderItems where product2.productcode != null ) 
                    FROM Order 
                    WHERE Id IN :orderIds
                ]);

                System.debug('Order Map items  are -->> ' + orderMap);

                
                if (!orderMap.isEmpty()) {
                    List<SBQQ__Quote__c> newQuoteList = new List<SBQQ__Quote__c>();
                    List<SBQQ__QuoteLine__c> newQuoteLineList = new List<SBQQ__QuoteLine__c>();
                    Map<Id, Id> orderToQuoteMap = new Map<Id, Id>();  // Map to store Order to Quote relationships

                    // Create Quotes from Orders
                    for (Order ord : orderMap.values()) {
                        SBQQ__Quote__c newQuote = new SBQQ__Quote__c();
                        newQuote.SBQQ__Account__c = ord.AccountId;
                        newQuote.SBQQ__PriceBook__c = '01sak000004KKRhAAO'; // Fetch dynamically if needed
                        newQuote.SBQQ__Primary__c = true;
                        newQuote.SBQQ__StartDate__c = ord.EffectiveDate;
                        newQuote.SBQQ__Status__c = 'Draft';
                        newQuote.SBQQ__Type__c = 'Quote';
                        newQuote.Order_Number_Insights__c = ord.OrderNumber;

                        newQuoteList.add(newQuote);
                    }

                    // Insert newly created Quotes and map Orders to Quotes
                    if (!newQuoteList.isEmpty()) {
                        insert newQuoteList;
                        System.debug('newQuoteList is -->> ' + newQuoteList);

                    }

                    // Map each Order to its corresponding Quote by matching Order Numbers
                    for (SBQQ__Quote__c insertedQuote : newQuoteList) {
                        for (Order ord : orderMap.values()) {
                            if (insertedQuote.Order_Number_Insights__c == ord.OrderNumber) {
                                orderToQuoteMap.put(ord.Id, insertedQuote.Id);
                            }
                        }
                    }

                    System.debug('orderToQuoteMap is -->> ' + orderToQuoteMap);

                    

                    // Create Quote Lines from Order Items
                    for (Order ord : orderMap.values()) {
                        for (OrderItem item : ord.OrderItems) {

                            System.debug('item is -->> ' + item);

                            Id quoteId = orderToQuoteMap.get(ord.Id);
                            if (quoteId != null && item != null) {
                                // Create Quote Line for each Order Item
                                SBQQ__QuoteLine__c newQuoteLine = new SBQQ__QuoteLine__c();
                                newQuoteLine.SBQQ__Product__c = item.Product2Id;
                                newQuoteLine.SBQQ__PricebookEntryId__c = getPricebookEntryId(item.Product2Id, '01sak000004KKRhAAO');  // Dynamically fetch Pricebook
                                newQuoteLine.SBQQ__Quote__c = quoteId;  // Link to the Quote
                                newQuoteLine.SBQQ__Quantity__c = item.Quantity;
                                newQuoteLine.SBQQ__CustomerPrice__c = item.UnitPrice;
                                newQuoteLine.SBQQ__ListPrice__c = item.UnitPrice;
                                newQuoteLine.SBQQ__OriginalPrice__c = item.UnitPrice;
                                newQuoteLine.SBQQ__PricingMethod__c = 'List';

                                newQuoteLineList.add(newQuoteLine);
                            }
                        }
                    }

                    // Insert newly created Quote Lines
                    if (!newQuoteLineList.isEmpty()) {

                        insert newQuoteLineList;
                        System.debug('newQuoteLineList is -->> ' + newQuoteLineList);
                    }

                    // Update Orders with the corresponding Quote Ids
                    List<Order> ordersToUpdate = new List<Order>();
                    for (Order ord : orderMap.values()) {
                        Id quoteId = orderToQuoteMap.get(ord.Id);
                        if (quoteId != null) {
                            ord.SBQQ__Quote__c  = quoteId;  
                            ordersToUpdate.add(ord);
                        }
                    }

                    // Update Orders with the Parent Quote Id
                    if (!ordersToUpdate.isEmpty()) {
                        // update ordersToUpdate;
                    }

                    System.debug('Quotes, Quote Lines, and Order updates completed successfully!');
                }
            }
        } catch (Exception e) {
            // Handle any errors
            System.debug('Error creating Quote from Order: ' + e.getMessage());
        }
    }

    public static Id getPricebookEntryId(String productId, String priceBookId) {
        try {
            // System.debug('ProductId -->> ' + productId);
            // System.debug('PriceBookId -->> ' + priceBookId);

            if (productId == null || priceBookId == null) {
                System.debug('ProductId or PriceBookId is null');
                return null;
            }

            List<PricebookEntry> priceBookEntryList = [SELECT Id FROM PricebookEntry WHERE Product2Id = :productId AND Pricebook2Id = :priceBookId LIMIT 1];
            return priceBookEntryList.isEmpty() ? null : priceBookEntryList[0].Id;
        } catch (Exception e) {
            System.debug('Error getting PriceBookEntry: ' + e.getMessage());
            return null;
        }
    }


}