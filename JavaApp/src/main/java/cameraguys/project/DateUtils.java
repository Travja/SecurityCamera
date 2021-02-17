package cameraguys.project;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

public class DateUtils {

    private static DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH-mm-ss");

    public static String formatString(long l) {
        return format.format(new Date(l));
    }

}
