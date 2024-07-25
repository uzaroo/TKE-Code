public with sharing class TKE_GeocodeResponse {
    public class Address_components {
        public String long_name;
        public String short_name;
        public List<String> types;
    }

    public class Geometry {
        public Bounds bounds;
        public Northeast location;
        public String location_type;
        public Bounds viewport;
    }

    public List<Results> results;
    public String status;

    public class Results {
        public List<Address_components> address_components;
        public String formatted_address;
        public Geometry geometry;
        public String place_id;
        public List<String> types;
    }

    public class Bounds {
        public Northeast northeast;
        public Northeast southwest;
    }

    public class Northeast {
        public Double lat;
        public Double lng;
    }

    public static String getCountyValue(String json) {
        String countyVal = '';
        TKE_GeocodeResponse geoCode = (TKE_GeocodeResponse)System.JSON.deserialize(json, TKE_GeocodeResponse.class);
        if(geoCode.status == 'OK'){
            for(TKE_GeocodeResponse.Address_components itr :geoCode.results[0].address_components){
                for(String type :itr.types){
                    if(type == System.Label.TKEGeocodeParam){
                        countyVal = itr.long_name.replaceAll(' County', '');
                        break;
                    }
                }
            }
        }
        return countyVal;
    }
}