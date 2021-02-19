package cameraguys.project.http;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

@AllArgsConstructor
public class HttpImageData {

    private static final String CRLF = "\r\n";
    private static final String BOUNDARY = "*****";
    @Getter
    @Setter
    private String url;
    @Getter
    @Setter
    private File file;

    public void uploadImage() {
        try {

            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setUseCaches(false);
            conn.setDoOutput(true);

            conn.setRequestMethod("POST");
            conn.setRequestProperty("Connection", "Keep-Alive");
            conn.setRequestProperty("Cache-Control", "no-cache");
            conn.setRequestProperty("Content-Type", "multipart/form-data;boundary=" + BOUNDARY);

            sendRequest(conn);

            handleResponse(conn);

        } catch (IOException e) {
            System.err.println("Could not upload file to server.");
            e.printStackTrace();
        }

    }

    private void sendRequest(HttpURLConnection conn) {
        try {
            String fileName = file.getName();
            String name = fileName.substring(0, fileName.lastIndexOf("."));
            DataOutputStream request = new DataOutputStream(conn.getOutputStream());
            request.writeBytes("--" + BOUNDARY + CRLF);
            request.writeBytes("Content-Disposition: form-data; name=\"" +
                    name + "\";filename=\"" + fileName + "\"" + CRLF);
            request.writeBytes(CRLF);

            request.write(convertToBytes(file));

            request.writeBytes(CRLF);
            request.writeBytes("--" + BOUNDARY + CRLF);

            request.flush();
            request.close();
            conn.disconnect();
        } catch (IOException e) {
            System.err.println("Could not upload file to server.");
            e.printStackTrace();
        }
    }

    private void handleResponse(HttpURLConnection conn) {
        try {
            InputStream in = new BufferedInputStream(conn.getInputStream());
            BufferedReader reader = new BufferedReader(new InputStreamReader(in));

            String line = "";
            StringBuilder sb = new StringBuilder();

            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }

            reader.close();

            String response = sb.toString();
            //TODO Do something with the response.
            in.close();
        } catch (IOException e) {
            System.err.println("Did not receive a valid response.");
            e.printStackTrace();
        }
    }

    private byte[] convertToBytes(File file) {
        try {
            BufferedInputStream in = new BufferedInputStream(new FileInputStream(file));
            return in.readAllBytes();
        } catch (IOException e) {
            System.err.println("Could not read file.");
            e.printStackTrace();
            return null;
        }
    }

}
