public without sharing class enableContractedQueueable_Insights implements Queueable {


    private List<order> recordList = new List<order>(); // Initialize the list here

    // Constructor to pass the orderMap to the queueable class
    public enableContractedQueueable_Insights(List<Order> orderList) {
        this.recordList = orderList;
    }

    public void execute(QueueableContext context) {

        try {

            for (Order ord : recordList) {

                if (ord.SBQQ__Contracted__c != true) {
                    ord.SBQQ__Contracted__c = true;
                }
            }
            system.debug('Contracted order List is' + recordList);

            
            // Perform the update
            if (!recordList.isEmpty()) {
                update recordList;
            }
            

        } catch (Exception e) {
            System.debug('Error in recordList: ' + e.getMessage());
        }
    }
}