//Created By - Sakshi Agnihotri
//ADO Id - 11993
//Created Date - 19/07/2024

public with Sharing class SFS_CalculateLocalTimeClass {
    
    //Method to convert a DateTime from one timezone to another.
    @InvocableMethod(label='Convert Datetime to Other Timezone' description='Converts a DateTime from one timezone to another.')
    public static List<ResultWrapper> convertToOtherTimeZone(List<RequestWrapper> requests)
    {
        List<ResultWrapper> results = new List<ResultWrapper>();
        
        for (RequestWrapper request : requests) {
            
            DateTime dttime = request.dttime;
            String sourceTimezone = UserInfo.getTimeZone().getID();
            String targetTimezone = request.targetTimezone;
            
            if(targetTimezone != NULL){
                
            TimeZone tz = Timezone.getTimeZone(sourceTimezone);
            Integer offset=tz.getOffset(dttime);
            
            TimeZone targetTZ = Timezone.getTimeZone(targetTimezone);
            integer offsetTotargetTZ = targetTZ.getOffset(dttime);
            integer correction = offsetTotargetTZ- offset;
            
            DateTime targetDT = dttime.addMinutes(correction / (1000 * 60));
            
            ResultWrapper result = new ResultWrapper();
            result.targetDT = targetDT;
            results.add(result);
                
            }
        }
        return results;
    }
    
    // Inner class for input parameters
    public class RequestWrapper {
        @InvocableVariable(label='Datetime' description='The DateTime to convert.')
        public DateTime dttime;
                
        @InvocableVariable(label='Target Timezone' description='The target timezone ID (e.g., America/New_York).')
        public String targetTimezone;
    }
    
    // Inner class for output results
    public class ResultWrapper {
        @InvocableVariable(label='Converted DateTime' description='The DateTime converted to the target timezone.')
        public DateTime targetDT;
    }
}