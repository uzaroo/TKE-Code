public without Sharing class SFS_ConvertDateTimeToLocalValue {
public static Datetime addTimeZoneOffset(Datetime origDateTime, String theTZone) {
    // note: need to subtract TZone offset to move forward in UTC time
    return adjustDateTimeForTimeZone(origDateTime, theTZone, true);
}

public static Datetime subtractTimeZoneOffset(Datetime origDateTime, String theTZone) {
    return adjustDateTimeForTimeZone(origDateTime, theTZone, false);
}

@TestVisible
public static Datetime adjustDateTimeForTimeZone(Datetime origDateTime, String theTZone, Boolean subtractOffset) {
    TimeZone tz = UserInfo.getTimeZone();

    if (theTZone != null) {
        tz = TimeZone.getTimeZone(theTZone);
    }
    // note: offset is negative so we need to multiply by -1 to move forward in UTC time
    return origDateTime.addSeconds(((Integer) (tz.getOffset(origDateTime) / 1000) * (subtractOffset ? -1 : 1)));
}

//Datetime orig = Datetime.newInstanceGmt(2024,11,02,16,05, 0);
//Datetime adjusted = subtractTimeZoneOffset(orig, 'America/Chicago');
//System.debug(adjusted);
}