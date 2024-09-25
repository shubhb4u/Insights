import { LightningElement, track } from 'lwc';

export default class Specifications extends LightningElement {
    @track sections = [
        {
            id: '1',
            label: 'Operating System',
            content: 'Amazon EC2 Oracle Database as a Service and Oracle Database Cloud Service have been tested.',
            isOpen: false
        },
        {
            id: '2',
            label: 'Processor',
            content: 'Processor content goes here.',
            isOpen: false
        },
        {
            id: '3',
            label: 'Memory',
            content: 'Memory content goes here.',
            isOpen: false
        },
        {
            id: '4',
            label: 'Cloud Support',
            content: 'Cloud Support content goes here.',
            isOpen: false
        }
    ];

    handleToggle(event) {
        const sectionId = event.currentTarget.dataset.id;
        this.sections = this.sections.map(section => {
            if (section.id === sectionId) {
                section.isOpen = !section.isOpen;
            }
            return section;
        });
    }

    sectionContentClass(isOpen) {
        return isOpen ? 'accordion-content open' : 'accordion-content';
    }

    getIcon(isOpen) {
        return isOpen ? '-' : '+';
    }
}