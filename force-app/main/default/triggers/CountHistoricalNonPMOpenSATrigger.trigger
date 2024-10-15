trigger CountHistoricalNonPMOpenSATrigger on ServiceAppointment (after insert, after update, after delete) {

    // Set to collect Work Order Ids
    Set<Id> workOrderIds = new Set<Id>();

    // Maps to track counts
    Map<Id, Integer> workOrderCounts = new Map<Id, Integer>();

    // Handle after insert or update
    if (Trigger.isInsert || Trigger.isUpdate) {
        for (ServiceAppointment sa : Trigger.new) {
            if (sa.SFS_Work_Order__c != null) {
                workOrderIds.add(sa.SFS_Work_Order__c);
            }
        }
    }

    // Handle after delete
    if (Trigger.isDelete) {
        for (ServiceAppointment sa : Trigger.old) {
            if (sa.SFS_Work_Order__c != null) {
                workOrderIds.add(sa.SFS_Work_Order__c);
            }
        }
    }

    // Query the Work Order objects with related Service Appointments
    Map<Id, WorkOrder> workOrders = new Map<Id, WorkOrder>([
        SELECT Id, 
               (SELECT Id, WorkTypeId, Status, DueDate FROM ServiceAppointments) 
        FROM WorkOrder 
        WHERE Id IN :workOrderIds
    ]);

    // Query the related Work Types
    Set<Id> workTypeIds = new Set<Id>();
    for (WorkOrder wo : workOrders.values()) {
        for (ServiceAppointment sa : wo.ServiceAppointments) {
            workTypeIds.add(sa.WorkTypeId);
        }
    }
    Map<Id, WorkType> workTypes = new Map<Id, WorkType>([
        SELECT Id, SFS_Is_PM__c 
        FROM WorkType 
        WHERE Id IN :workTypeIds
    ]);

    // Calculate the date 30 days ago
    DateTime thirtyDaysAgo = DateTime.now().addDays(-30);
    DateTime today = DateTime.now();

    // Update counts
    for (WorkOrder wo : workOrders.values()) {
        Integer count = 0;
        for (ServiceAppointment sa : wo.ServiceAppointments) {
            WorkType workType = workTypes.get(sa.WorkTypeId);
            if (workType != null && !workType.SFS_Is_PM__c && 
                sa.DueDate != null && sa.DueDate >= thirtyDaysAgo && sa.DueDate <= today && 
                sa.Status != 'Completed' && 
                sa.Status != 'Cannot Complete' && 
                sa.Status != 'Canceled') {
                count++;
            }
        }
        workOrderCounts.put(wo.Id, count);
    }

    // Update Work Orders with the new counts
    List<WorkOrder> workOrdersToUpdate = new List<WorkOrder>();
    for (Id workOrderId : workOrderCounts.keySet()) {
        WorkOrder wo = new WorkOrder(Id = workOrderId, TP_Count_Historical_Non_PM_Appointments__c = workOrderCounts.get(workOrderId));
        workOrdersToUpdate.add(wo);
    }

    if (!workOrdersToUpdate.isEmpty()) {
        update workOrdersToUpdate;
    }
}