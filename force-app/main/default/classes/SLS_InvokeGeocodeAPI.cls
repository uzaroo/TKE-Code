/**
 * @description:  Class created to be invoked from Visual Flows
 *                with custom input and call Google Geocode Api to
 *                returns data to the flow
 */
public with sharing class SLS_InvokeGeocodeAPI {

    @InvocableMethod(
        label='Call Geocode Api'
        description='Invocable Method to call Google Geocode API'
    )
    public static List<List<String>> getCountyInformation(
        List<String> inputAddress
    ) {
        List<List<String>> result = new List<List<String>>();
        if(inputAddress.size() == 1){
            HttpResponse response = TKE_GeocodeService.callGeoCode(inputAddress[0].replaceAll(' ',''));
            String countyVal = TKE_GeocodeResponse.getCountyValue(response.getBody());
            result.add(new List<String>{countyVal});
        }else {
            for(Integer i = 0; i < inputAddress.size(); i++){
                result.add(new List<String>{''});
            }
        }
        return result;
    }
}