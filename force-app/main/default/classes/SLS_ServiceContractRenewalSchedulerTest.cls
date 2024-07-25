/**
 * @description:  Test Class created for SLS_ServiceContractRenewalSchedulerTest renewing ServiceContractRenewal US-16309
 */
@isTest
public class SLS_ServiceContractRenewalSchedulerTest {

    @testSetup
    static void setup() {
        // Create test data using the data factory
        Account testAccount = TKETestDataFactory.createTestAccount();
        Product2 testProduct = TKETestDataFactory.createTestProduct();
        Pricebook2 pb = TKETestDataFactory.createTestPricebook('custom');
        PricebookEntry testPricebookEntry = TKETestDataFactory.createCustomPricebookEntry(testProduct, pb);
        
        // Create a Service Contract
        List<ServiceContract> serviceContracts = new List<ServiceContract>();
        for (Integer i = 0; i < 5; i++) {
            serviceContracts.add(new ServiceContract(
                AccountId = testAccount.Id,
                StartDate = Date.today(),
                
                EndDate = Date.today().addDays(1),
                Renewal_Process__c = 'Manual',
                Name = 'SC' + i
            ));
        }
        insert serviceContracts;
        
        // Create Opportunities linked to Service Contracts
        List<Opportunity> testOpportunities = new List<Opportunity>();
        for (ServiceContract sc : serviceContracts) {
            testOpportunities.add(new Opportunity(
                Name = 'Test Opportunity ' + sc.Id,
                StageName = 'Identified',
                BudgetaryStartDate__c = Date.today(),
                CloseDate = Date.today().addDays(30),
                AccountId = testAccount.Id,
                Service_Contract__c = sc.Id,
                CustomersFiscalYear__c = Date.today(),
                 Line_Of_Business__c = 'Modernization',
                Type_Of_Sale__c = 'Modernization',
                RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('Capital_Plan').getRecordTypeId()
            ));
        }
        insert testOpportunities;

        // Create Opportunity Line Items
        TKETestDataFactory.createTestOpportunityLineItems(testOpportunities, testProduct, testPricebookEntry);
    }

    @isTest
    static void testBatchExecution() {
        Integer numberOfDays = 1;
        String recordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('Capital_Plan').getRecordTypeId();
        
        Map<String, Renewal_Parameters__mdt> metadataMap = Renewal_Parameters__mdt.getAll();
        Decimal OppnumberOfDays = metadataMap.get('Opportunity_Capital_Plan').No_of_Days__c;
        String OppdateFieldAPIName = metadataMap.get('Opportunity_Capital_Plan').Date_field_API_name__c;  
        Decimal SCnumberOfDays = metadataMap.get('Service_Contract_Manual').No_of_Days__c;
        String SCdateFieldAPIName = metadataMap.get('Service_Contract_Manual').Date_field_API_name__c;
        String manualFlag = 'Manual';
        
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get('Opportunity').getDescribe().fields.getMap();
        List<String> fieldList = new List<String>();
        for (String fieldName : fieldMap.keySet()) {
            fieldList.add(fieldName);
        }
        String Allopptyfields = String.join(fieldList, ',');
        
        // Construct the dynamic SOQL query
        String query = 'Select ' + Allopptyfields +
                       ' FROM Opportunity ' +
                       'WHERE (' + OppdateFieldAPIName + ' = NEXT_N_DAYS:' + OppnumberOfDays +
                       ' AND RecordTypeId = \'' + recordTypeId + '\')' +
                       ' OR (Service_Contract__r.' + SCdateFieldAPIName + ' = NEXT_N_DAYS:' + SCnumberOfDays +
                       ' AND Service_Contract__r.Renewal_Process__c = \'' + manualFlag + '\')';
        
        List<Opportunity> opplist = Database.query(query);
        System.debug('*****' + query);
        System.debug('****' + opplist.size());
        
        // Instantiate the batch class with the dynamic query
        SLS_CPOpptyRenewalBatch batchJob = new SLS_CPOpptyRenewalBatch(query);
        
        // Execute the batch class
        Test.startTest();
        Database.executeBatch(batchJob, 200);
        Test.stopTest();
        
        List<Opportunity> originaloppList = [SELECT ID FROM Opportunity WHERE Parent_Opportunity__c = null];
        System.debug(originaloppList.size() + ' originalOppCount');
        
        // Verify that the opportunities have been cloned correctly
        Integer clonedOpportunitiesCount = [SELECT COUNT() FROM Opportunity WHERE Parent_Opportunity__c != null];
        System.assertEquals(5, clonedOpportunitiesCount, 'The number of cloned opportunities is incorrect.');

        // Verify that the opportunity line items have been cloned correctly
        Integer originalLineItemsCount = [SELECT COUNT() FROM OpportunityLineItem WHERE OpportunityId IN :originaloppList];
        System.assertEquals(5, originalLineItemsCount, 'The number of cloned opportunity line items is incorrect.');
        Integer clonedLineItemsCount = [SELECT COUNT() FROM OpportunityLineItem WHERE OpportunityId NOT IN :originaloppList];
        System.assertEquals(5, clonedLineItemsCount, 'The number of cloned opportunity line items is incorrect.');

        // Verify that the custom child objects have been cloned correctly
        Integer clonedAssetOpportunitiesCount = [SELECT COUNT() FROM Asset_Opportunity__c WHERE Opportunity__c IN (SELECT Id FROM Opportunity WHERE Parent_Opportunity__c != null)];
        System.assertEquals(0, clonedAssetOpportunitiesCount, 'The number of cloned custom child objects is incorrect.');
    }

    @isTest
    static void testBatchEmptyScope() {
        // Create a batch instance with an empty query
        String query = 'SELECT Id, Name, StageName, CloseDate, Pricebook2Id FROM Opportunity WHERE Id = \'\'';
        SLS_CPOpptyRenewalBatch batchInstance = new SLS_CPOpptyRenewalBatch(query);

        // Execute the batch with an empty scope
        Test.startTest();
        Database.executeBatch(batchInstance, 1); // Single batch of 1 to ensure empty scope execution
        Test.stopTest();

        // Verify no opportunities are cloned
        Integer clonedOpportunitiesCount = [SELECT COUNT() FROM Opportunity WHERE Parent_Opportunity__c != null];
        System.assertEquals(0, clonedOpportunitiesCount, 'No opportunities should have been cloned.');
    }

    @isTest
    static void testSchedulerExecution() {
        // Initialize the scheduler class
        SLS_ServiceContractRenewalScheduler schedulerInstance = new SLS_ServiceContractRenewalScheduler();
        String sch = '0 0 0 * * ?'; // Schedule the job to run daily

        // Schedule the batch job using System.scheduleBatch
        Test.startTest();
        String jobId = System.schedule('SLS_ServiceContractRenewalScheduler', sch, schedulerInstance);
        Test.stopTest();

        // Verify that the job was scheduled
        CronTrigger ct = [SELECT Id, CronExpression, TimesTriggered, NextFireTime FROM CronTrigger WHERE Id = :jobId];
        System.assertEquals(sch, ct.CronExpression, 'The cron expression is incorrect.');
    }
}