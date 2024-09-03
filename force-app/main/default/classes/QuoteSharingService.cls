public with sharing class QuoteSharingService {

    // Method to share a specific SBQQ__Quote__c record with a user or group
    public static void shareQuoteRecord(Id quoteId, Id userOrGroupId, String accessLevel) {
        try {
            // Create a new instance of the share object
            SBQQ__Quote__Share quoteShare = new SBQQ__Quote__Share();
            
            // Set the fields on the share object
            quoteShare.ParentId = quoteId;  // The ID of the SBQQ__Quote__c record to be shared
            quoteShare.UserOrGroupId = userOrGroupId;  // The ID of the User or Group with whom the record is shared
            quoteShare.AccessLevel = accessLevel;  // Access level (e.g., 'Read', 'Edit')

            // Insert the share record to apply the sharing rule
            insert quoteShare;
            System.debug('Quote record shared successfully with User/Group ID: ' + userOrGroupId);
            
        } catch (Exception e) {
            // Handle any errors that occur during the sharing process
            System.debug('An error occurred while sharing the quote record: ' + e.getMessage());
            throw new AuraHandledException('An error occurred while sharing the quote record.');
        }
    }
}
