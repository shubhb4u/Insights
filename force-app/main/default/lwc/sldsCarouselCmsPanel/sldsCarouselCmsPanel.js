import { LightningElement, api, wire, track } from 'lwc';
import { getContent } from 'experience/cmsDeliveryApi';
import siteId from '@salesforce/site/Id';

export default class SldsCarouselCmsPanel extends LightningElement {
  @api
  contentKey;
  @track data;
  baseDomain= 'https://etgdigital6-dev-ed.develop.my.site.com/InsightsB2Bvforcesite/sfsites/c/';
  url;

  @wire(getContent, { channelOrSiteId: siteId, contentKeyOrId: '$contentKey' })
  onGetContent(result) {
    if (result.data) {
      this.data = result.data;
      console.log('this.data.contentBody.url ->>>>>>>>>>>>>> ', this.data.contentBody['sfdc_cms:media'].url);
      this.url = this.baseDomain+ this.data.contentBody['sfdc_cms:media'].url;
      
    } else if (result.error) {
      // Handle error, e.g., display a placeholder image or message
      console.error(result.error);
    }
  }

}