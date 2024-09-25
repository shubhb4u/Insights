public with sharing class ManagedContentController {

    public ManagedContentController() {}
    @AuraEnabled(cacheable=true)
    public static List<ContentType> getManagedContentByContentKeys(String communityId,List<String> contentKeys, List<String> topics,Integer pageParam, Integer pageSize, String language,  String managedContentType, Boolean showAbsoluteUrl) {
        try {
            // String communityId = Network.getNetworkId();
            // communityId = [SELECT Id FROM Network WHERE Name = 'Insights B2B'].Id;
            ConnectApi.ManagedContentVersionCollection managedContentVersionCollection = ConnectApi.ManagedContent.getManagedContentByContentKeys(communityId, contentKeys, pageParam, pageSize, language, managedContentType, false);
            return getCMSContent(managedContentVersionCollection);
        }catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    private static List<ContentType> getCMSContent(ConnectApi.ManagedContentVersionCollection managedContentVersionCollection) {
        try {
            List<ConnectApi.ManagedContentVersion> managedContentVersions = managedContentVersionCollection.items;
            List<ContentType> contentTypes = new List<ContentType>();
            for(ConnectApi.ManagedContentVersion managedContentVersion : managedContentVersions){
                ContentType contentTypeObj = new ContentType();
                contentTypeObj.key = managedContentVersion.contentKey;
                contentTypeObj.title = managedContentVersion.contentNodes.get('title');
                contentTypeObj.subTitle = managedContentVersion.contentNodes.get('sub_title');
                contentTypeObj.body = managedContentVersion.contentNodes.get('body');
                contentTypeObj.image = managedContentVersion.contentNodes.get('image');
                contentTypeObj.publishedDate = managedContentVersion.publishedDate;
                contentTypes.add(contentTypeObj);
            }
            return contentTypes;
        }catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    public class ContentType {
        @AuraEnabled public string key {get; set;}
        @AuraEnabled public ConnectApi.ManagedContentNodeValue title {get; set;}
        @AuraEnabled public ConnectApi.ManagedContentNodeValue subTitle {get; set;}
        @AuraEnabled public ConnectApi.ManagedContentNodeValue body {get; set;}
        @AuraEnabled public ConnectApi.ManagedContentNodeValue image {get; set;}
        @AuraEnabled public Datetime publishedDate {get; set;}
        Public ContentType(){}
    }
}