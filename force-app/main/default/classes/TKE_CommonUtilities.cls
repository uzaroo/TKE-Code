public inherited sharing class TKE_CommonUtilities {
    
    //Adjusts a datetime value for a specified time zone and returns the adjusted datetime.
    public static Datetime adjustDateTimeForTimeZone(Datetime origDateTime, String theTZone, boolean subtractOffset) {
        TimeZone tz = UserInfo.getTimeZone();
        
        if (theTZone != null) {
            tz = TimeZone.getTimeZone(theTZone);
        }
        
        return origDateTime.addSeconds(((Integer) (tz.getOffset(origDateTime) / 1000) * (subtractOffset ? -1 : 1)));
    }
    
}