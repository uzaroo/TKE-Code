/**
 * @description:  Class created for renewing Opportunity US-15168
 */
public class SLS_ServiceContractRenewalScheduler implements Schedulable {

    public void execute(SchedulableContext sc) {
        // Construct the dynamic query based on custom metadata settings
        Renewal_Parameters__mdt settings;
        if (Test.isRunningTest()) {
            settings = new Renewal_Parameters__mdt(No_of_Days__c = 1, Date_field_API_name__c = 'EndDate',DeveloperName ='Service_Contract_Manual');
        } else {
            settings = [SELECT No_of_Days__c, Date_field_API_name__c FROM Renewal_Parameters__mdt WHERE DeveloperName='Service_Contract_Manual' LIMIT 1];
        }
       
        Integer numberOfDays = Integer.valueOf(settings.No_of_Days__c);
        String recordTypeIdbject = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('Capital_Plan').getRecordTypeId();
        String dateFieldAPIName = settings.Date_field_API_name__c;
        
        Map<String,Renewal_Parameters__mdt> metadataMap = Renewal_Parameters__mdt.getAll();
        Decimal OppnumberOfDays= metadataMap.get('Opportunity_Capital_Plan').No_of_Days__c;
        String OppdateFieldAPIName = metadataMap.get('Opportunity_Capital_Plan').Date_field_API_name__c;  
        Decimal SCnumberOfDays= metadataMap.get('Service_Contract_Manual').No_of_Days__c;
        String SCdateFieldAPIName = metadataMap.get('Service_Contract_Manual').Date_field_API_name__c; 
        String manualFlag = 'Manual';
        String Allopptyfields = SLS_Util.getObjectFields('Opportunity');
        // Construct the dynamic SOQL query
        String query = 'Select '+ Allopptyfields+
                       ' FROM Opportunity ' +
                       'WHERE (' + OppdateFieldAPIName + ' = NEXT_N_DAYS:' + OppnumberOfDays +
                       ' AND RecordTypeId = \'' + recordTypeIdbject + '\')' +
                       ' OR (Service_Contract__r.EndDate = NEXT_N_DAYS:' + SCnumberOfDays+
                       ' AND Service_Contract__r.Renewal_Process__c = \'' + manualFlag + '\')';

        // Instantiate the batch class with the dynamic query
        SLS_CPOpptyRenewalBatch batchJob = new SLS_CPOpptyRenewalBatch(query);
        
        // Execute the batch job
        Database.executeBatch(batchJob, 200); // Adjust batch size as needed
    }
    
}