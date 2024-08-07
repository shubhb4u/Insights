import { LightningElement, api, wire } from 'lwc';
import { getContent } from 'experience/cmsDeliveryApi';
import siteId from '@salesforce/site/Id';
import basePath from '@salesforce/community/basePath';

export default class SldsCarouselCmsPanel extends LightningElement {
    @api
    contentKey = '20Yak000000QfM7EAK';
    data;
    url;

    @wire(getContent, {channelOrSiteId: siteId, contentKeyOrId: '$contentKey'})
    onGetContent(result) {
        if(result.data) {
            this.data = result.data;
            console.log('data in child component ->>>>>>>>>>>>>>  ', this.data);
            console.log('data.unauthenticatedUrl -->>>>>>>> ', result.data.unauthenticatedUrl);
            console.log('basePath is -->>>>> ', basePath);

            this.formUrl();
        }
    }

    

    formUrl(){
        this.url = basePath+ '/sfsites/c'+ this.data.resourceUrl;
        console.log('url is --->>>>>>> '+ this.url);
    }
}
