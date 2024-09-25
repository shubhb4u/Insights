({
    showMessage : function(component) {
        var currentMessage = component.get("v.message");
        component.set("v.message", currentMessage + " You clicked the button!");
    }
})