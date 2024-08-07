({
    doInit : function(component, event, helper) {
        // Initialization logic can go here
        console.log('Component initialized');
    },

    handleClick : function(component, event, helper) {
        helper.showMessage(component);
    }
})