({
  onLoadComponent: function (cmp, event, helper) {
    let pageProductId = helper.getProductDetailProductId();
    if (pageProductId) {
      // Component is on a product detail page; show Similar Products recommender
      cmp.set("v.title", "Similar Products");
      cmp.set("v.recommender", "SimilarProducts");
      cmp.set("v.anchorValues", pageProductId);
    } else {
      // Show Recently Viewed recommender
      cmp.set("v.title", "Recently Viewed");
      cmp.set("v.recommender", "RecentlyViewed");
      cmp.set("v.anchorValues", "");
    }
    helper.loadProductRecommendations(cmp, event, helper);
  },

  // send a clickReco activity and navigate to the product detail page
  handleClickProduct: function (cmp, event, helper) {
    let productId = event.currentTarget.getAttribute("data-pid");
    let trackClickReco = cmp.find("activitiesApi").trackClickReco;
    let recName = helper.recommenderNames[cmp.get("v.recommender")];
    let uuid = cmp.get("v.uuid");
    let products = cmp.get("v.products");
    let product = products.filter((p) => p.id === productId)[0];
    let productToSend = {
      id: product.id,
      price: product.prices ? product.prices.listPrice : undefined,
    };
    trackClickReco(recName, uuid, productToSend);

    // navigate to the product page
    let storeName = "Solar Winds";
    let productName = product.name || "detail";
    let newHref = `/${storeName}/s/product/${productName}/${productId}`;
    window.location.href = newHref;
  },
});