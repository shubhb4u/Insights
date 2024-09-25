public with sharing class recsController {
	 @AuraEnabled
    public static String getRecs(String recommender, String anchorValues, String cookie) {
        String orgDomain = 'etgdigital6-dev-ed.develop.lightning.force.com';
        String webstoreId = '0ZEak0000018Y44GAE';
        String endpoint = 'https://'+orgDomain+'/services/data/v55.0/commerce/webstores/'+webstoreId+'/ai/recommendations?language=en-US&asGuest=true&recommender='+recommender;
        if (anchorValues.length() > 0) {
            endpoint += '&anchorValues='+anchorValues;
        }

        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setHeader('Cookie', cookie);
        req.setMethod('GET');
        req.setHeader('Authorization', 'OAuth ' + UserInfo.getSessionId());

        Http http = new Http();
        HTTPResponse res = http.send(req);
        return res.getBody();
    }
}