public with sharing class ManagedContentController {

    public ManagedContentController() {}
    @AuraEnabled(cacheable=true)
    public static List<productMedia> getProductMedia(){

        List<ProductMedia> proMediaList = [select id, ProductId, ElectronicMediaId from ProductMedia ]
    }