/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 07-04-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public without sharing class DisplayQuoteRecords {


@AuraEnabled
public static List<Quote> DisplayQuoteRecs(string contactId) {
    if(ContactId!=null){
    List<Quote> qLidt=[select id,ContactId,Contact.Account.name,Status,Name,ExpirationDate,TotalPrice,Quote_PDF_Download__c,QuoteNumber, Discount from Quote where ContactId = : ContactId ORDER BY CreatedDate DESC];
    System.debug('qLidt:'+qLidt);
    return qLidt;
    }else{
        List<Quote> qLidt1=[select id,ContactId from Quote where ContactId = '003Hp00002urk0KIAQ'];
        return qLidt1;
    }
}


//For CPQ Quote records --
@AuraEnabled
public static List<SBQQ__Quote__c> DisplayCPQQuoteRecs(string accountId) {
    try {
        if (accountId != null) {
            List<SBQQ__Quote__c> cpqQuoteList = [SELECT Id, SBQQ__PrimaryContact__c, SBQQ__Account__c, SBQQ__Status__c, Name, SBQQ__ExpirationDate__c, SBQQ__NetAmount__c, SBQQ__AdditionalDiscountAmount__c 
                                                 FROM SBQQ__Quote__c 
                                                 WHERE SBQQ__Account__c = :accountId 
                                                 ORDER BY CreatedDate DESC];
            System.debug('Fetched CPQ Quote List:--->>>>> ' + cpqQuoteList);
            return cpqQuoteList;
        } else {
            // Handle the case where accountId is null
            List<SBQQ__Quote__c> defaultCPQQuoteList = [SELECT Id, SBQQ__PrimaryContact__c, SBQQ__Account__c, SBQQ__Status__c, Name, SBQQ__ExpirationDate__c, SBQQ__NetAmount__c, SBQQ__AdditionalDiscountAmount__c 
                                                        FROM SBQQ__Quote__c 
                                                        WHERE SBQQ__Account__c = '001ak00000OfQTlAAN'];
            return defaultCPQQuoteList;
        }
    } catch (Exception e) {
        System.debug('Error fetching CPQ quotes: ' + e.getMessage());
        throw new AuraHandledException('An error occurred while fetching CPQ quotes.'); // Consider throwing an exception
    }
    
}

@AuraEnabled
public static String getDownloadLink(String quoId) {
        if (quoId != null) {
            List<Quote> quoList = [SELECT Id, Quote_PDF_Download__c, Status FROM Quote WHERE Id = :quoId];
            System.debug('quoList:' + quoList);

                String downLink = quoList.isEmpty() ? '' : quoList[0].Quote_PDF_Download__c;
                if (!String.isBlank(downLink)) {
                    return downLink;
                }
            }
        // Return a default message if quoId is null
        return 'Invalid quoId';
    }
}