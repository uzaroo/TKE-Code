public class TKETestDataFactory {
    public static Account createTestAccount() {
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        return testAccount;
    }

    public static Product2 createTestProduct() {
        Product2 testProduct = new Product2(Name = 'Test Product', IsActive = true);
        insert testProduct;
        return testProduct;
    }
    public static Pricebook2 createTestPricebook(String name) {
        Pricebook2 pb = new Pricebook2(Name = 'Custom pricebook',isActive = true);
        insert pb;
        return pb;
    }
    public static PricebookEntry createCustomPricebookEntry(Product2 testProduct,Pricebook2 pb) {
       PricebookEntry testPricebookEntry = new PricebookEntry(
            Pricebook2Id = Test.getStandardPricebookId(),
            Product2Id = testProduct.Id,
            UnitPrice = 100,
            IsActive = true,
            UseStandardPrice = false
            
        );
        insert testPricebookEntry;
        return testPricebookEntry;
    }
    public static PricebookEntry createTestPricebookEntry(Product2 testProduct) {
        Pricebook2 standardPricebook = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
        PricebookEntry testPricebookEntry = new PricebookEntry(
            Pricebook2Id = standardPricebook.Id,
            Product2Id = testProduct.Id,
            UnitPrice = 100,
            IsActive = true
        );
        insert testPricebookEntry;
        return testPricebookEntry;
    }

    public static List<Opportunity> createTestOpportunities(Account testAccount, Integer numOpportunities) {
        List<Opportunity> testOpportunities = new List<Opportunity>();
        String recordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('Capital_Plan').getRecordTypeId();
        Map<String, Renewal_Parameters__mdt> metadataMap = Renewal_Parameters__mdt.getAll();
        Integer OppnumberOfDays= Integer.valueOf(metadataMap.get('Opportunity_Capital_Plan').No_of_Days__c);
        for (Integer i = 0; i < numOpportunities; i++) {
            Opportunity opp = new Opportunity(
                Name = 'Test Opportunity ' + i,
                CloseDate = Date.today().addDays(30),
                StageName = 'Identified',
                AccountId = testAccount.Id,
                BudgetaryStartDate__c = Date.today().addDays(OppnumberOfDays),
                RecordTypeId = recordTypeId,
                Line_Of_Business__c = 'Modernization',
                Type_Of_Sale__c = 'Modernization'
            );
            testOpportunities.add(opp);
        }
        insert testOpportunities;
        return testOpportunities;
    }

    public static List<OpportunityLineItem> createTestOpportunityLineItems(List<Opportunity> opportunities, Product2 testProduct, PricebookEntry testPricebookEntry) {
        List<OpportunityLineItem> testLineItems = new List<OpportunityLineItem>();
        for (Opportunity opp : opportunities) {
            OpportunityLineItem oli = new OpportunityLineItem(
                OpportunityId = opp.Id,
                Product2Id = testProduct.Id,
                Quantity = 1,
                UnitPrice = 100,
                PricebookEntryId = testPricebookEntry.Id
            );
            testLineItems.add(oli);
        }
        insert testLineItems;
        return testLineItems;
    }

    public static List<Asset> createTestAssets(Account testAccount, Integer numAssets) {
        List<Asset> testAssets = new List<Asset>();
        for (Integer i = 0; i < numAssets; i++) {
            Asset asset = new Asset(
                Name = 'Test Asset ' + i,
                AccountId = testAccount.Id,
                InstallDate = Date.today().addDays(-60)
            );
            testAssets.add(asset);
        }
        insert testAssets;
        return testAssets;
    }
     

    public static List<Asset_Opportunity__c> createTestAssetOpportunities(List<Opportunity> opportunities, List<Asset> assets) {
        List<Asset_Opportunity__c> testAssetOpportunities = new List<Asset_Opportunity__c>();
        for (Integer i = 0; i < opportunities.size(); i++) {
            Asset_Opportunity__c assetOpp = new Asset_Opportunity__c(
                Opportunity__c = opportunities[i].Id,
                Asset__c = assets[i].Id
     
                
            );
            testAssetOpportunities.add(assetOpp);
        }
        insert testAssetOpportunities;
        return testAssetOpportunities;
    }
    
      public static List<WorkOrder> createTestWorkOrders(Account testAccount, Integer numWorkOrders) {
        List<WorkOrder> testWorkOrders = new List<WorkOrder>();
        for (Integer i = 1; i <= numWorkOrders; i++) {
            WorkOrder workObj = new WorkOrder(
                Subject = 'Test Work Order',
                Priority = 'High',
                AccountId = testAccount.Id,
                Status = 'Scheduled'
            );
            testWorkOrders.add(workObj);
        }
        insert testWorkOrders;
        return testWorkOrders;
    }
    
    public static List<ServiceAppointment> createTestServiceAppointment(WorkOrder testWorkOrder, Integer numSAs) {
        List<ServiceAppointment> testServiceAppointments = new List<ServiceAppointment>();
        for (Integer i = 1; i <= numSAs; i++) {
            ServiceAppointment SA = new ServiceAppointment(
                Subject = 'Test Appointment',
                Status = 'None',
                ArrivalWindowStartTime  = Datetime.newInstanceGmt(2024, 11, 2, 16, 5, 0),
                ArrivalWindowEndTime  = Datetime.newInstanceGmt(2024, 11, 2, 17, 0, 0),
                ParentRecordId = testWorkOrder.Id
            );
            testServiceAppointments.add(SA);
        }
        insert testServiceAppointments;
        return testServiceAppointments;
    }
}