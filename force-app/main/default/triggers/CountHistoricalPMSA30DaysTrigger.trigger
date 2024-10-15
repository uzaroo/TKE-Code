trigger CountHistoricalPMSA30DaysTrigger on ServiceAppointment (after insert, after update, after delete) {

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

    // Current date and date 30 days ago
    Date today = Date.today();
    Date date30DaysAgo = today.addDays(-30);

    // Update counts
    for (WorkOrder wo : workOrders.values()) {
        Integer count = 0;
        for (ServiceAppointment sa : wo.ServiceAppointments) {
            WorkType workType = workTypes.get(sa.WorkTypeId);
            if (workType != null && workType.SFS_Is_PM__c && 
                sa.DueDate != null && 
                sa.DueDate.date() <= today && 
                sa.DueDate.date() >= date30DaysAgo) {
                count++;
            }
        }
        workOrderCounts.put(wo.Id, count);
    }

    // Update Work Orders with the new counts
    List<WorkOrder> workOrdersToUpdate = new List<WorkOrder>();
    for (Id workOrderId : workOrderCounts.keySet()) {
        WorkOrder wo = new WorkOrder(Id = workOrderId, TP_Count_Historical_PM_SA_30_days__c = workOrderCounts.get(workOrderId));
        workOrdersToUpdate.add(wo);
    }

    if (!workOrdersToUpdate.isEmpty()) {
        update workOrdersToUpdate;
    }
}