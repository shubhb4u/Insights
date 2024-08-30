import { LightningElement, api } from 'lwc';

export default class Counter extends LightningElement {
    @api counterValue = 1;

    handleIncrement() {
        this.counterValue += 1;
        this.dispatchCounterChangeEvent();
    }

    handleDecrement() {
        if (this.counterValue > 0) {
            this.counterValue -= 1;
            this.dispatchCounterChangeEvent();
        }
    }

    dispatchCounterChangeEvent() {
        const counterChangeEvent = new CustomEvent('counterchange', {
            detail: this.counterValue
        });
        this.dispatchEvent(counterChangeEvent);
    }
}