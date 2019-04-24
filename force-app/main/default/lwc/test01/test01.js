import { LightningElement ,track,wire } from 'lwc';
import {
    CurrentPageReference
  } from 'lightning/navigation';
import {
    registerListener,
    unregisterAllListeners,
} from 'c/pubsub';

export default class Test01 extends LightningElement {
    @track isPage = true;

    jamping(event) {
      if(event.target.value === 'true')
          this.isPage = true;
      else
          this.isPage = false;
    }

    /* 受け取る */
    @wire(CurrentPageReference) pageRef;
    @track inpVal;
      
    connectedCallback() {
        // subscribe to inputChangeEvent event
        registerListener('menu1', this.jamping2, this);
    }

    disconnectedCallback() {
        // unsubscribe from inputChangeEvent event
        unregisterAllListeners(this);
    }

    jamping2(inpVal) {
        this.isPage = inpVal;
    }
    /* /受け取る */





}