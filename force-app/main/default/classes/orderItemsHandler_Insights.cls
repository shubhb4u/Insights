public without sharing class orderItemsHandler_Insights {
    

    public static void createQuotefromOrder(List<orderItem> orderItemList){

        try {
        
            Set<Id> orderIds = new Set<Id>();
            if (!orderItemList.isEmpty()) {

                for (orderItem ord : orderItemList) {
                    orderIds.add(ord.OrderId);  
                }
                System.debug('Order Ids are -->> ' + orderIds);
            }

            if (!orderIds.isEmpty()) {
                // Query Orders and related Order Items (assuming these are required for Quote Lines)
                Map<Id,Order> orderMap = new Map<Id, Order>([
                    SELECT Id, Name, AccountId, EffectiveDate,SBQQ__Quote__c, Status, TotalAmount, PoNumber, 
                           OrderReferenceNumber, SBQQ__Contracted__c, OrderNumber, createdDate, ContractId, Account.BillingAddress, 
                           Account.BillingCity, Account.BillingCountry, Account.BillingState, Type,
                           (SELECT Id, orderId, PricebookEntryId,  Quantity, Product2Id, Product2.Description, UnitPrice FROM OrderItems where product2.productcode != null ) 
                    FROM Order 
                    WHERE Id IN :orderIds
                ]);

                System.debug('Order Map items  are -->> ' + orderMap);

                List<SBQQ__Quote__c> newQuoteList = new List<SBQQ__Quote__c>();
                List<SBQQ__QuoteLine__c> newQuoteLineList = new List<SBQQ__QuoteLine__c>();
                Map<Id, Id> orderToQuoteMap = new Map<Id, Id>(); 

                if(!orderMap.isEmpty()){

                     // Map to store Order to Quote relationships

                    // Create Quotes from Orders
                    for (Order ord : orderMap.values()) {
                        SBQQ__Quote__c newQuote = new SBQQ__Quote__c();
                        newQuote.SBQQ__Account__c = ord.AccountId;
                        newQuote.SBQQ__PriceBook__c = '01sak000004KKRhAAO'; // Fetch dynamically if needed
                        newQuote.SBQQ__PricebookId__c = '01sak000004KKRhAAO'; 
                        newQuote.SBQQ__Primary__c = true;
                        newQuote.SBQQ__Ordered__c = true;
                        newQuote.SBQQ__StartDate__c = ord.EffectiveDate;
                        newQuote.SBQQ__Status__c = 'Draft';
                        newQuote.SBQQ__Type__c = 'Quote';
                        newQuote.SBQQ__LastCalculatedOn__c = System.now().addSeconds(2);
                        newQuote.Order_from_B2B_store_Insights__c = true;
                        // newQuote.SBQQ__Opportunity2__c = '006ak000005NHIDAA4';
                        // newQuote.SBQQ__AveragePartnerDiscount__c = 0;
                        // newQuote.SBQQ__Uncalculated__c = false;
                        newQuote.Order_Number_Insights__c = ord.OrderNumber;

                        newQuoteList.add(newQuote);
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
                                    newQuoteLine.SBQQ__RegularPrice__c = item.UnitPrice;
                                    newQuoteLine.SBQQ__CustomerPrice__c = item.UnitPrice;
                                    newQuoteLine.SBQQ__NetPrice__c = item.UnitPrice;
                                    newQuoteLine.SBQQ__PricingMethod__c = 'List';
                                    newQuoteLine.SBQQ__Number__c = count;
                                    // newQuoteLine.SBQQ__TotalDiscountAmount__c = 0;
                                    // newQuoteLine.SBQQ__TotalDiscountRate__c = 0;

                                    newQuoteLineList.add(newQuoteLine);

                                    count+=1;
                                }
                            }
                        }

                        // Insert newly created Quote Lines
                        if (!newQuoteLineList.isEmpty()) {

                            insert newQuoteLineList;
                            System.debug('newQuoteLineList is -->> ' + newQuoteLineList);
                        }

                        
                    }

                    // try {
                    //     //update order with their parent Quote - 
                    //     List<Order> updateOrderWithQuote = new List<order>();
                    //     for(order ord: orderMap.values()){
                    //         if(orderToQuoteMap.containsKey(ord.id)){
                    //             ord.SBQQ__Quote__c = orderToQuoteMap.get(ord.Id);
                    //             updateOrderWithQuote.add(ord);
                    //         }
                    //     }

                    //     if(!updateOrderWithQuote.isEmpty()){
                    //         update updateOrderWithQuote;
                    //     }
                    // } catch (DmlException d) {
                    //     System.debug('Error updating Orders with Quote: ' + d.getMessage());
                    // }

                }

            }
        
        } catch (Exception e) {
            
            System.debug('Error creating Quote -->>> '+ e.getMessage());
        }

    }

    public static Id getPricebookEntryId(String productId, String priceBookId) {
        try {

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