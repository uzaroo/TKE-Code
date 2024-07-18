@isTest
public with sharing class SLS_InvokeGeocodeAPITest {

    @testSetup static void setup() {
        List<Account> testAccts = new List<Account>();
        for(Integer i=0;i<2;i++) {
            testAccts.add(new Account(Name = 'TestAcct'+i,
            BillingCity = 'San Francisco',
            BillingState = 'California',
            BillingCountry = 'United States'));
        }
        insert testAccts;        
    }


    @isTest static void testCallout() {
        Account acct = [
            SELECT Id,
            BillingCity,
            BillingState,
            BillingPostalCode 
            FROM Account WHERE Name='TestAcct0' LIMIT 1
        ];
        acct.BillingPostalCode = '94104';

        List<String> inputAddress = new List<String>();
        inputAddress.add(acct.BillingCity + ',' + acct.BillingState + ',' +  acct.BillingPostalCode);

        Test.setMock(HttpCalloutMock.class, new TKE_MockGeocodeApiResponse());
        List<String> res = SLS_InvokeGeocodeAPI.getCountyInformation(inputAddress);
        Assert.areEqual(
            'San Francisco', 
            res[0], 
            'Please check the response returned'
        );
    }
}