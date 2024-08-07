public class B2BFeaturedProducts {

    // Get the featured products and associated thumbnail images
    @AuraEnabled(cacheable=true)
    public static List<featuredProductWrapper> getFeaturedProducts() {
        // Initialize a list of the wrapper class type for storing return data
        List<featuredProductWrapper> productData = new List<featuredProductWrapper>();

        // Get all of the featured products that are currently active
        List<Product2> featuredProducts = [
            SELECT Id, Name
            FROM Product2
            WHERE IsActive = TRUE AND StockKeepingUnit LIKE 'FR%'
        ];

        System.debug('featuredProducts are ->>> ' + featuredProducts);

        // Get the id of the relevant community
        Id communityId = [
            SELECT Id
            FROM Network
            WHERE Name = 'Insights B2B'
            LIMIT 1
        ].Id;

        System.debug('communityId is ->>> ' + communityId);

        // Get the ProductMedia records associated with each product
        for (Product2 featuredProduct : featuredProducts) {
            Id productId = featuredProduct.Id;
            ProductMedia productMediaMetadata;
            try {
                productMediaMetadata = [
                    SELECT Id, ElectronicMediaId FROM ProductMedia where ProductId  = :productId
                    LIMIT 1
                ];
            } catch (Exception e) {
                System.debug('No ProductMedia found for product: ' + productId);
                continue;
            }

            System.debug('productMediaMetadata ->>> ' + productMediaMetadata);

            // Get the ElectronicMediaId value from the ProductMedia record
            Id mediaId = productMediaMetadata.ElectronicMediaId;

            // The managed content ids have to be in a list of type string
            List<String> contentIds = new List<String>();
            contentIds.add(mediaId);

            // Get the thumbnail image data
            ConnectApi.ManagedContentVersionCollection imageData;
            try {
                imageData = ConnectApi.ManagedContent.getManagedContentByIds(
                    communityId,
                    contentIds,
                    0,
                    1,
                    'en_US',
                    'cms_image'
                );
            } catch (ConnectApi.ConnectApiException e) {
                System.debug('ConnectApiException: ' + e.getMessage());
                continue;
            } catch (Exception e) {
                System.debug('Exception: ' + e.getMessage());
                continue;
            }

            System.debug('imageData ->>> ' + imageData);

            productData.add(new featuredProductWrapper(featuredProduct, imageData));
        }

        return productData;
    }

    // The wrapper class for featured product data
    public class featuredProductWrapper {
        @AuraEnabled
        public Product2 featuredProduct { get; set; }
        @AuraEnabled
        public ConnectApi.ManagedContentVersionCollection productImage { get; set; }

        public featuredProductWrapper(
            Product2 featuredProduct,
            ConnectApi.ManagedContentVersionCollection productImage
        ) {
            this.featuredProduct = featuredProduct;
            this.productImage = productImage;
        }
    }
}