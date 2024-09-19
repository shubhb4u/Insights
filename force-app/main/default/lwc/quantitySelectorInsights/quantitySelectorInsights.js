import { LightningElement, api, track } from 'lwc';

export default class QuantitySelectorInsights extends LightningElement {
    @track quantity = 1; // Default quantity

    @api
    get productId() {
        return this._productId;
    }

    set productId(value) {
        this._productId = value;
        this.dispatchQuantityChange();
    }

    increaseQuantity() {
        this.quantity++;
        this.dispatchQuantityChange();
    }

    decreaseQuantity() {
        if (this.quantity > 1) {
            this.quantity--;
            this.dispatchQuantityChange();
        }
    }

    dispatchQuantityChange() {
        const quantityChangeEvent = new CustomEvent('quantitychange', {
            detail: {
                id: this.productId,
                quantity: this.quantity
            }
        });
        this.dispatchEvent(quantityChangeEvent);
    }
}
