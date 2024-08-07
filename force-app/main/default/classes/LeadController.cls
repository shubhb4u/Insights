/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-30-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public class LeadController {
    @AuraEnabled
    public static void createLead(String email) {
        Lead newLead = new Lead(
            LastName = 'Demo Request', // Provide a default last name
            Company = 'ETG', // Provide a default company
            Email = email
            
            //Status = 'New' // Set an appropriate status for the new lead
        );
        try {
            insert newLead;
        } catch (DmlException e) {
            throw new AuraHandledException('Unable to create lead: ' + e.getMessage());
        }
    }
}