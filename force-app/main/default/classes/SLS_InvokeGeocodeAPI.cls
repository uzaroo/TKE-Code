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
        List<List<String>> inputAddress
    ) {
        List<List<String>> result = new List<List<String>>();
        System.debug('Size of input'+ inputAddress.size());
        if(inputAddress.size() == 1 && inputAddress[0].size() == 1){
            TKE_GeocodeResponse response = TKE_GeocodeService.callGeoCode(inputAddress[0][0].replaceAll(' ',''));
            if(response.status == 'OK'){
                for(TKE_GeocodeResponse.Address_components itr :response.results[0].address_components){
                    for(String type :itr.types){
                        if(type == 'administrative_area_level_2'){
                            result.add(new List<String>{itr.long_name.replaceAll(' County', '')});
                            break;
                        }
                    }
                }
            }
        }
        System.debug('Size of result'+ result.size());
        return result;
    }
}