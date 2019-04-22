import { LightningElement, track } from 'lwc';
export default class HelloWorld extends LightningElement {
  @track greeting = 'World';
  @track isPage = false;

  changeHandler(event) {
    this.greeting = event.target.value;
  }

  jamping(event) {
    this.isPage = event.target.value;
  }
}