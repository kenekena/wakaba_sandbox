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

export default class Publishsource extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    /* 送りこむ */
    handleChange(event) {
        fireEvent(this.pageRef, 'inputChangeEvent', event.target.value);
    }
    /* /送りこむ */
    
    /* 受け取る */
    @track inpVal2;
    
    connectedCallback() {
        // subscribe to inputChangeEvent event
        registerListener('inputChangeEvent2', this.handleChange2, this);
    }

    disconnectedCallback() {
        // unsubscribe from inputChangeEvent event
        unregisterAllListeners(this);
    }

    handleChange2(inpVal2) {
        this.inpVal2 = inpVal2;
    }
    /* /受け取る */
    
}