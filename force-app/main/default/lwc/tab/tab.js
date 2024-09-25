import { LightningElement } from 'lwc';

export default class Tab extends LightningElement {
    connectedCallback() {
        this.template.addEventListener('click', (event) => {
            if (event.target.classList.contains('slds-tabs_default__link')) {
                event.preventDefault();
                const targetId = event.target.getAttribute('aria-controls');
                
                // Remove active class from all tabs and hide all contents
                const tabs = this.template.querySelectorAll('.slds-tabs_default__link');
                const contents = this.template.querySelectorAll('.slds-tabs_default__content');
                
                tabs.forEach(tab => {
                    tab.parentNode.classList.remove('slds-is-active');
                    tab.setAttribute('aria-selected', 'false');
                });
                contents.forEach(content => {
                    content.classList.add('slds-hide');
                    content.classList.remove('slds-show');
                });

                // Add active class to clicked tab and show corresponding content
                event.target.parentNode.classList.add('slds-is-active');
                event.target.setAttribute('aria-selected', 'true');
                this.template.querySelector(`#${targetId}`).classList.add('slds-show');
                this.template.querySelector(`#${targetId}`).classList.remove('slds-hide');
            }
        });
    }
}