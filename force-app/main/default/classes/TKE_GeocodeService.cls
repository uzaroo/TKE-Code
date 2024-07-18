public with sharing class TKE_GeocodeService {
    public static final String NAMED_CREDENTIAL = 'TKENamedGeocodeCredential';


    public static TKE_GeocodeResponse callGeoCode(
        String address
    ){
        try {
            TKE_GeocodeResponse result = new TKE_GeocodeResponse();

            HttpRequest request = new HttpRequest();
            request.setEndpoint(
                getEndpoint(address) + '&key=' + System.label.TKE_Geocode_API
            );
            request.setMethod('GET');
            Http http = new Http();
            HttpResponse response = http.send(request);

            result = (TKE_GeocodeResponse)JSON.deserialize(response.getBody(), TKE_GeocodeResponse.class);
            return result;
        } catch (Exception ex) {
            System.debug(
                LoggingLevel.INFO,
                'Callout Failed. Error is: ' + ex.getMessage()
            );
            return null;       
        }
    }

    public static String getEndpoint(
        String address
    ){
        String baseURL = 'callout:'+NAMED_CREDENTIAL;
        String endpoint = baseURL + '/maps/api/geocode/json?address=' + address;
        return endpoint;
    }
}