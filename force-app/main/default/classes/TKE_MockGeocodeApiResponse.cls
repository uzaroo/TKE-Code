public class TKE_MockGeocodeApiResponse implements HttpCalloutMock {
    public HTTPResponse respond(HTTPRequest req) {        
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"results" : [{"address_components" : [{"long_name" : "San Francisco County","types" : ["administrative_area_level_2","political"]}]}],"status" : "OK"}');
        res.setStatusCode(200);
        //result = (TKE_GeocodeResponse)JSON.deserialize(response.getBody(), TKE_GeocodeResponse.class);
        return res;
    }
}