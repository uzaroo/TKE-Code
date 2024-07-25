public class TestInvocable {
    @InvocableMethod(label='Test Invocable' description='Test Invocable')
    public static List<ResultWrapper> convertToOtherTimeZone(List<RequestWrapper> requests)
    {
        List<ResultWrapper> results = new List<ResultWrapper>();
        for (RequestWrapper request : requests) {
            ResultWrapper result = new ResultWrapper();
            List<ServiceAppointment> listResult = [SELECT id,ArrivalWindowStartTime,AppointmentNumber,DueDate from ServiceAppointment where Id=:request.inputList];
            result.resultList = new List<sObject>();
            result.resultList.addAll(listResult);
            results.add(result);
        }
        return results;
    }
    public class RequestWrapper {
        @InvocableVariable(label='inputList' description='The DateTime to convert.')
        public Id inputList;
        
    }
    public class ResultWrapper {
        @InvocableVariable(label='resultList' description='The DateTime converted to the target timezone.')
        public List<sObject> resultList;
    }
}