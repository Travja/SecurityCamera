package cameraguys.project.http;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

@NoArgsConstructor
public class ConnectionInformation {

    @Getter
    @Setter
    private String name,
            email,
            password,
            url;

    public static ConnectionInformation load() {
        ConnectionInformation conn = new ConnectionInformation();
        try (BufferedReader reader = new BufferedReader(new FileReader(new File("server.conf")))) {
            conn.setName(reader.readLine());
            conn.setEmail(reader.readLine());
            conn.setPassword(reader.readLine());
            conn.setUrl(reader.readLine());
            return conn;
        } catch (IOException e) {
            System.err.println("Could not read server configuration");
            e.printStackTrace();
            return null;
        }
    }

    public static URL getFinalURL(URL url) {
        try {
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setInstanceFollowRedirects(false);
            con.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36");
            con.addRequestProperty("Accept-Language", "en-US,en;q=0.8");
            con.addRequestProperty("Referer", "https://www.google.com/");
            con.connect();
            //con.getInputStream();
            int resCode = con.getResponseCode();
            if (resCode == HttpURLConnection.HTTP_SEE_OTHER
                    || resCode == HttpURLConnection.HTTP_MOVED_PERM
                    || resCode == HttpURLConnection.HTTP_MOVED_TEMP) {
                String Location = con.getHeaderField("Location");
                if (Location.startsWith("/")) {
                    Location = url.getProtocol() + "://" + url.getHost() + Location;
                }
                return getFinalURL(new URL(Location));
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        return url;
    }


}
