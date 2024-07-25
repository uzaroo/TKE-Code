public with sharing class TKE_GeocodeService {
    public static final String NAMED_CREDENTIAL = 'TKENamedGeocodeCredential';


    public static HttpResponse callGeoCode(
        String address
    ){
        HttpRequest request = new HttpRequest();
        request.setEndpoint(
            getEndpoint(address) + '&key=' + System.label.TKE_Geocode_API
        );
        request.setMethod('GET');
        Http http = new Http();
        HttpResponse response = http.send(request);
        return response;
    }

    public static String getEndpoint(
        String address
    ){
        String baseURL = 'callout:'+NAMED_CREDENTIAL;
        String endpoint = baseURL + '/maps/api/geocode/json?address=' + address;
        return endpoint;
    }
}