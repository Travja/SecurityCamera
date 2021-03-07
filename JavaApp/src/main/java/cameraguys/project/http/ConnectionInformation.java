package cameraguys.project.http;

import javafx.scene.control.Alert;
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
    public static int id;
    private static ConnectionInformation info;
    @Getter
    @Setter
    private String name,
            email,
            password,
            url,
            cameraName;

    /**
     * Loads the connection information from the server.conf file.
     *
     * @return {@link ConnectionInformation}
     */
    public static ConnectionInformation load() {
        if (info != null)
            return info;

        ConnectionInformation conn = new ConnectionInformation();
        try (BufferedReader reader = new BufferedReader(new FileReader(new File("server.conf")))) {
            conn.setName(reader.readLine());
            conn.setEmail(reader.readLine());
            conn.setPassword(reader.readLine());
            conn.setUrl(reader.readLine());
            conn.setCameraName(reader.readLine());
            info = conn;
            return conn;
        } catch (IOException e) {
            System.err.println("Could not read server configuration");
            e.printStackTrace();
            return null;
        }
    }

    public static void purge() {
        info = null;
    }

    public static boolean testConnection(String server, String email, String password, boolean showSuccess) {
        boolean connected = false;
        try {
            connected = new HttpAuthenticate(server + "/api/login", email, password).authenticate();

            if (connected) {
                if (showSuccess) {
                    Alert alert = new Alert(Alert.AlertType.INFORMATION);
                    alert.setHeaderText("Connection successful!");
                    alert.setContentText("You're good to go! The connection succeeded!");
                    alert.showAndWait();
                }
            } else {
                Alert alert = new Alert(Alert.AlertType.ERROR);
                alert.setHeaderText("Could not connect");
                alert.setContentText("Authentication failed.");
                alert.showAndWait();
            }
        } catch (IOException e) {
            System.err.println("Could not execute auth check: " + e.getCause());
            e.printStackTrace();
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setHeaderText("Could not connect");
            alert.setContentText("Could not establish a connection to the server.");
            alert.showAndWait();
        }

        return connected;
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
