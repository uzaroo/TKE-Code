@isTest
public with sharing class SLS_InvokeGeocodeAPITest {

    @testSetup static void setup() {
        List<Account> testAccts = new List<Account>();
        for(Integer i=0;i<2;i++) {
            testAccts.add(new Account(Name = 'TestAcct'+i,
            BillingCity = 'San Francisco',
            BillingState = 'California',
            BillingStreet = '788 Circle 75 Parkway Southeast',
            BillingCountry = 'United States'));
        }
        insert testAccts;        
    }

    @isTest static void testCallout() {
        Account acct = [
            SELECT Id,
            BillingCity,
            BillingState,
            BillingPostalCode,
            BillingCountryCode,
            BillingStreet
            FROM Account WHERE Name='TestAcct0' LIMIT 1
        ];
        acct.BillingPostalCode = '94104';
        List<String> inputAddress = new List<String>{
            acct.BillingCity + ',' + 
            acct.BillingState + ',' +  
            acct.BillingPostalCode + ',' +
            acct.BillingCountryCode
        };

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new TKE_MockGeocodeApiResponse());
        List<List<String>> res = SLS_InvokeGeocodeAPI.getCountyInformation(inputAddress);
        Assert.areNotEqual(
            0,
            res.size(),  
            'Please check the response returned'
        );
        Test.stopTest();
    }

    @isTest static void testNullCallout() {
        List<String> inputAddress = new List<String>{
            '',
            ''
        };

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new TKE_MockGeocodeApiResponse());
        List<List<String>> res = SLS_InvokeGeocodeAPI.getCountyInformation(inputAddress);
        Assert.areNotEqual(
            0,
            res.size(),  
            'Please check the response returned'
        );
        Test.stopTest();
    }
}