import { LightningElement, track } from 'lwc';
export default class HelloWorld extends LightningElement {
  @track greeting = 'World';
  @track isPages = false;
  @track areDetailsVisible = false;

  changeHandler(event) {
    this.greeting = event.target.value;
  }

  jamping(event) {
    this.isPages = event.target.value;
  }

  handleChange(event) {
    this.areDetailsVisible = event.target.checked;
  }

}