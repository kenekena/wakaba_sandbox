import { LightningElement,track } from 'lwc';
export default class PegeLinktest extends LightningElement {
  @track isPage = true;

  jamping(event) {
    if(event.target.value === 'true')
        this.isPage = true;
    else
        this.isPage = false;
  }

}