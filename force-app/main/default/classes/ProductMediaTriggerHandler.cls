public class ProductMediaTriggerHandler {
    
    public static void updateProductContentType(List<ProductMedia> productMediaList) {
        // Create a map to hold Product2 Ids and their corresponding Content_Type__c value
        Map<Id, String> productContentTypeMap = new Map<Id, String>();

        // Iterate over the list of ProductMedia records
        for (ProductMedia media : productMediaList) {
            // Get the Product2 Id from the ProductMedia record
            Id productId = media.ProductId;

            // Determine the content type based on your logic
            // Here, we assume the content type can be derived from a field on ProductMedia, adjust as necessary
            String contentType = media.ElectronicMediaId; // Replace this with actual logic to determine content type

            // Update the map with the new content type
            productContentTypeMap.put(productId, contentType);
        }

        // Get the existing Product2 records to update
        List<Product2> productsToUpdate = [SELECT Id, Content_Type__c FROM Product2 WHERE Id IN :productContentTypeMap.keySet()];

        // Update the Content_Type__c field
        for (Product2 product : productsToUpdate) {
            product.Content_Type__c = productContentTypeMap.get(product.Id);
        }

        // Perform the update
        if (!productsToUpdate.isEmpty()) {
            upsert productsToUpdate;
        }
    }
}
