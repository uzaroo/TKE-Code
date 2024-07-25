//Created By - Sakshi Agnihotri
//ADO Id - 11993
//Created Date - 19/07/2024
//Test Class - SFS_CalculateLocalTimeClassTest

public without Sharing class SFS_CalculateLocalTimeClass {
    
    //Method to convert a DateTime from one timezone to another.
    @InvocableMethod(label='Convert Datetime to Other Timezone' description='Converts a DateTime from one timezone to another.')
    public static List<ResultWrapper> convertToOtherTimeZone(List<RequestWrapper> requests)
    {
        List<ResultWrapper> results = new List<ResultWrapper>();
        
        for (RequestWrapper request : requests) {
            
            String TimeZone = request.theTZone;
            List<String> fieldList = request.fieldList;
            String IdField = TKE_CommonConstants.ID_FIELD;
            String fields = String.join(new List<String>{IdField, String.join(fieldList, ',')}, ',');
            Id recordId = request.recordId;
            boolean subtractOffset = request.subtractOffset;
                        
            String objectName = recordId.getSObjectType().getDescribe().getName();
            Map<String,String> localFieldMap = generateFieldMap(objectName);
            
            String query = 'SELECT ' + fields + ' FROM ' + objectName + ' WHERE Id = :recordId LIMIT 1';
            SObject record = Database.query(query);
            
            for(String str:fieldList)
            {
                DateTime targetDT = TKE_CommonUtilities.adjustDateTimeForTimeZone((DateTime) record.get(str),TimeZone,subtractOffset);
                record.put(localFieldMap.get(str),convertDateTimeToString(targetDT));
            }
            ResultWrapper result = new ResultWrapper();
            result.updatedRecord = record;
            results.add(result);
            
        }
        return results;
    }
    
    public static Map<String,String> generateFieldMap(String objName){
        Map<String,String> localFieldMap = new Map<String,String>();
        List<SFS_Custom_Settings__mdt> fieldList = [SELECT id,DeveloperName,Value__c FROM SFS_Custom_Settings__mdt WHERE Related_Object_Name__c =:objName AND Category__c = 'Timezone Conversions'];
        for(SFS_Custom_Settings__mdt setting : fieldList){
            localFieldMap.put(setting.DeveloperName, setting.Value__c);
        }
        return localFieldMap;
    }
    // Inner class for input parameters
    public class RequestWrapper {
        @InvocableVariable(label='subtractOffset' description='The offset')
        public boolean subtractOffset;
        
        @InvocableVariable(label='Target Timezone' description='The target timezone ID (e.g., America/New_York).')
        public String theTZone;
        
        @InvocableVariable(label='FieldList' description='The fields that needs the conversion')
        public List<String> fieldList;
        
        @InvocableVariable(label='recordId' description='Id of the record')
        public Id recordId;
  
    }
    
    // Inner class for output results
    public class ResultWrapper {
        @InvocableVariable(label='Updated Record' description='Record after update')
        public sObject updatedRecord;
    }

    public static String convertDateTimeToString(DateTime dt) {
        String formattedDateTime = dt.formatGmt(TKE_CommonConstants.AMPM_FORMAT);
        return formattedDateTime;
    }
}