import {
    LightningElement,
    track,
    wire
} from 'lwc';
import {
    CurrentPageReference
} from 'lightning/navigation';
import {
    registerListener,
    unregisterAllListeners,
    fireEvent
} from 'c/pubsub';

export default class Publishreceiver extends LightningElement {
      @wire(CurrentPageReference) pageRef;
      /* 送りこむ */
      handleChange2(event) {
        fireEvent(this.pageRef, 'inputChangeEvent2', event.target.value);
      }
      /* /送りこむ */

      /* 受け取る */
      @track inpVal;
      
      connectedCallback() {
          // subscribe to inputChangeEvent event
          registerListener('inputChangeEvent', this.handleChange, this);
      }

      disconnectedCallback() {
          // unsubscribe from inputChangeEvent event
          unregisterAllListeners(this);
      }

      handleChange(inpVal) {
          this.inpVal = inpVal;
      }
      /* /受け取る */


      
      


}