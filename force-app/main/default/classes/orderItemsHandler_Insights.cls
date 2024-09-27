public without sharing class orderItemsHandler_Insights {
    

    public static void createQuotefromOrder(List<OrderItem> orderItemList) {
        

        try {
            Set<Id> orderIds = new Set<Id>();
            List<SBQQ__Quote__c> newQuoteList = new List<SBQQ__Quote__c>();
            List<SBQQ__QuoteLine__c> newQuoteLineList = new List<SBQQ__QuoteLine__c>();
            Map<Id, Id> orderToQuoteMap = new Map<Id, Id>();
            

            if (!orderItemList.isEmpty()) {
                for (OrderItem ord : orderItemList) {
                    orderIds.add(ord.OrderId);
                }
                System.debug('Order Ids are -->> ' + orderIds);
            }

            if (!orderIds.isEmpty()) {
                // Query Orders and related Order Items (assuming these are required for Quote Lines)
                Map<Id, Order> orderMap = new Map<Id, Order>([
                    SELECT Id, Name, AccountId, EffectiveDate, SBQQ__Quote__c, Status, TotalAmount, PoNumber, 
                           OrderReferenceNumber, SBQQ__Contracted__c, OrderNumber, CreatedBy.ContactId , CreatedDate, ContractId, Account.BillingAddress, 
                           Account.BillingCity, Account.BillingCountry, Account.BillingState, Type,
                           (SELECT Id, OrderId, PricebookEntryId, Quantity, Product2Id, Product2.Description, UnitPrice 
                            FROM OrderItems 
                            WHERE Type  != 'Delivery Charge') 
                    FROM Order 
                    WHERE Id IN :orderIds
                ]);

                System.debug('Order Map items are -->> ' + orderMap);

                

                if (!orderMap.isEmpty()) {
                    // Create Quotes from Orders
                    for (Order ord : orderMap.values()) {

                        //If order status is Activated that means it is created from store.
                        if(ord.CreatedBy.ContactId != null){

                            SBQQ__Quote__c newQuote = new SBQQ__Quote__c();
                            newQuote.SBQQ__Account__c = ord.AccountId;
                            newQuote.SBQQ__PriceBook__c = getPricebookId(); // Fetch dynamically if needed
                            newQuote.SBQQ__PricebookId__c = getPricebookId(); 
                            newQuote.SBQQ__Primary__c = true;
                            newQuote.SBQQ__StartDate__c = ord.EffectiveDate;
                            newQuote.SBQQ__Status__c = 'Draft';
                            newQuote.SBQQ__Type__c = 'Quote';
                            // newQuote.SBQQ__LastCalculatedOn__c = System.now().addSeconds(2);
                            newQuote.Order_from_B2B_store_Insights__c = true;
                            newQuote.Order_Number_Insights__c = ord.OrderNumber;

                            newQuoteList.add(newQuote);
                        }
                        
                    }

                    // Insert newly created Quotes and map Orders to Quotes
                    if (!newQuoteList.isEmpty()) {
                        insert newQuoteList;
                        System.debug('newQuoteList is -->> ' + newQuoteList);

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
                            Integer count = 1;
                            for (OrderItem item : ord.OrderItems) {
                                Id quoteId = orderToQuoteMap.get(ord.Id);
                                if (quoteId != null && item != null) {
                                    SBQQ__QuoteLine__c newQuoteLine = new SBQQ__QuoteLine__c();
                                    newQuoteLine.SBQQ__Product__c = item.Product2Id;
                                    newQuoteLine.SBQQ__PricebookEntryId__c = getPricebookEntryId(item.Product2Id, '01sak000004KKRhAAO');
                                    newQuoteLine.SBQQ__Quote__c = quoteId;
                                    newQuoteLine.SBQQ__Quantity__c = item.Quantity;
                                    newQuoteLine.SBQQ__CustomerPrice__c = item.UnitPrice;
                                    newQuoteLine.SBQQ__ListPrice__c = item.UnitPrice;
                                    newQuoteLine.SBQQ__OriginalPrice__c = item.UnitPrice;
                                    newQuoteLine.SBQQ__RegularPrice__c = item.UnitPrice;
                                    newQuoteLine.SBQQ__NetPrice__c = item.UnitPrice;
                                    newQuoteLine.SBQQ__PricingMethod__c = 'List';
                                    newQuoteLine.SBQQ__Number__c = count;

                                    newQuoteLineList.add(newQuoteLine);
                                    count += 1;
                                }
                            }
                        }

                        // Insert newly created Quote Lines
                        if (!newQuoteLineList.isEmpty()) {
                            insert newQuoteLineList;
                            System.debug('newQuoteLineList is -->> ' + newQuoteLineList);

                            // After inserting the Quotes and populating the orderToQuoteMap
                            if (!orderToQuoteMap.isEmpty()) {
                                System.debug('Enqueuing job to update orders with quote IDs');
                                
                                // Enqueue the queueable class to update orders with the parent quote ID
                                // System.enqueueJob(new UpdateOrderWithQuoteId_Insights(orderToQuoteMap));
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.debug('Error creating Quote -->>> ' + e.getMessage());
        }
    }

    public static Id getPricebookId() {
        try {
            
            List<PriceBook2> priceBookList = [select id, name from Pricebook2 where name = 'Insights B2B Price Book'];
            return priceBookList.isEmpty() ? null : priceBookList[0].Id;
        } catch (Exception e) {
            System.debug('Error getting priceBookList: ' + e.getMessage());
            return null;
        }
    }

    public static Id getPricebookEntryId(String productId, String priceBookId) {
        try {
            if (productId == null || priceBookId == null) {
                System.debug('ProductId or PriceBookId is null');
                return null;
            }

            List<PricebookEntry> priceBookEntryList = [
                SELECT Id FROM PricebookEntry WHERE Product2Id = :productId AND Pricebook2Id = :priceBookId LIMIT 1
            ];
            return priceBookEntryList.isEmpty() ? null : priceBookEntryList[0].Id;
        } catch (Exception e) {
            System.debug('Error getting PriceBookEntry: ' + e.getMessage());
            return null;
        }
    }
}