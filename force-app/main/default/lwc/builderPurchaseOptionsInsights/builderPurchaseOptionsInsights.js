import { LightningElement, api, track } from 'lwc';

export default class BuilderProductPurchaseOptions extends LightningElement {

    counter = 1; // Set the initial value of counter to 1

    handleIncrement() {
        this.counter += 1;
        this.dispatchCounterChange();
    }

    handleDecrement() {
        if (this.counter > 1) {
            this.counter -= 1;
        }
        this.dispatchCounterChange();
    }

    dispatchCounterChange() {
        // Ensure the counter is a valid number and dispatch the event
        this.dispatchEvent(new CustomEvent('counterchange', {
            detail: { counter: this.counter }
        }));
    }
}
