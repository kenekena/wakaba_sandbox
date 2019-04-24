import { LightningElement,track, wire } from 'lwc';

import {
  CurrentPageReference
} from 'lightning/navigation';
import {
  fireEvent
} from 'c/pubsub';


export default class testLwc extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @track isPageGo;

  jamping2(event){
    /* hrefのクリック時のデフォルト動作を防ぐ */
    event.preventDefault();
    if(event.target.value === 'true')
      this.isPageGo = true;
    else
      this.isPageGo = false;
    fireEvent(this.pageRef, 'menu1', this.isPageGo);
    
  }
 
}