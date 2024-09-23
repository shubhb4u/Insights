import { LightningElement, api, track } from 'lwc';

export default class BuilderProductPurchaseOptions extends LightningElement {

   @api productId;
  @api quantity = 1;

  handleDecrease() {
    if (this.quantity > 1) {
      this.quantity--;
      this.dispatchEvent(new CustomEvent('quantitychange', { detail: { productId: this.productId, quantity: this.quantity } }));
    }
  }

  handleIncrease() {
    this.quantity++;
    this.dispatchEvent(new CustomEvent('quantitychange', { detail: { productId: this.productId, quantity: this.quantity } }));
  }

  handleInputChange(event) {
    const newQuantity = parseInt(event.target.value, 10);
    if (newQuantity >= 1) {
      this.quantity = newQuantity;
      this.dispatchEvent(new CustomEvent('quantitychange', { detail: { productId: this.productId, quantity: this.quantity } }));
    }
  }
}