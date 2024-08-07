import { LightningElement, api, wire, track } from 'lwc';
import { getContent } from 'experience/cmsDeliveryApi';
import siteName from '@salesforce/schema/SiteName';
import basePath from '@salesforce/community/basePath';

export default class SldsCarouselCmsPanel extends LightningElement {
  @api
  contentKey = '20Yak000000QfM7EAK';
  @track data;
  url;

  @wire(getContent, { channelOrSiteId: siteName, contentKeyOrId: '$contentKey' })
  onGetContent(result) {
    if (result.data) {
      this.data = result.data;
      console.log('data in child component ->>>>>>>>>>>>>> ', this.data);
      console.log(
        'data.unauthenticatedUrl -->>>>>>>> ',
        result.data.unauthenticatedUrl
      );
      console.log('basePath is -->>>>> ', basePath);
      this.formUrl();
    } else if (result.error) {
      // Handle error, e.g., display a placeholder image or message
      console.error(result.error);
    }
  }

  formUrl() {
    const baseUrl = `https://${siteName}.develop.my.site.com`; // Dynamic base URL
    const pathPrefix = '/sfsites/c'; // Adjust if your path structure is different

    this.url = `${baseUrl}${basePath}${pathPrefix}${this.data.unauthenticatedUrl}`;
    console.log('url is --->>>>>>> ', this.url);
  }
}
