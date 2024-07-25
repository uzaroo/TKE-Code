@isTest
public class SFS_CalculateLocalTimeClassTest {
    @TestSetup
    static void setup() {
        Account testAccount = TKETestDataFactory.createTestAccount();
        
        List<WorkOrder> testWorkOrder = TKETestDataFactory.createTestWorkOrders(testAccount,1);
        
        List<ServiceAppointment> testAppointment = TKETestDataFactory.createTestServiceAppointment(testWorkOrder[0],1);
        
    }
    @isTest
    static void testConvertToOtherTimeZone() {
        ServiceAppointment testAppointment = [SELECT Id FROM ServiceAppointment LIMIT 1];
        
        List<SFS_Custom_Settings__mdt> settings = [
            SELECT Id, DeveloperName, Value__c
            FROM SFS_Custom_Settings__mdt
            WHERE Category__c =: TKE_CommonConstants.CATEGORY_TIMEZONECONVERSION
        ];
        
        SFS_CalculateLocalTimeClass.RequestWrapper request = new SFS_CalculateLocalTimeClass.RequestWrapper();
        request.subtractOffset = false;
        request.theTZone = TKE_CommonConstants.TIMEZONE_NEWYORK;
        request.fieldList = new List<String>{ TKE_CommonConstants.ARRIVALWINDOW_STARTTIME, TKE_CommonConstants.ARRIVALWINDOW_ENDTIME };
            request.recordId = testAppointment.Id; 
        
        List<SFS_CalculateLocalTimeClass.RequestWrapper> requests = new List<SFS_CalculateLocalTimeClass.RequestWrapper>();
        requests.add(request);
        
        Test.startTest();
        List<SFS_CalculateLocalTimeClass.ResultWrapper> results = SFS_CalculateLocalTimeClass.convertToOtherTimeZone(requests);
        Test.stopTest();
        
        System.assertEquals(1, results.size());
        System.assertNotEquals(null, results[0].updatedRecord);
    }
}