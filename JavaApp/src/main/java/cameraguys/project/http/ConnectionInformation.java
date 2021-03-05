package cameraguys.project.http;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

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

}
