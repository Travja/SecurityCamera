package cameraguys.project.http;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import okhttp3.*;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

@AllArgsConstructor
public class HttpAuthenticate {

    @Getter
    @Setter
    private String url,
            email,
            password;

    /**
     * Sends an email to the current user with the attached file.
     */
    public boolean authenticate() throws IOException {

        if (!url.startsWith("http"))
            url = "http://" + url;

        try {
            url = ConnectionInformation.getFinalURL(new URL(url)).toString();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }


        OkHttpClient client = new OkHttpClient().newBuilder()
                .build();

        String json = "{" +
                "\"email\": \"" + email + "\"," +
                "\"password\": \"" + password + "\"" +
                "}";

        Request body = new Request.Builder()
                .url(url)
                .method("POST", RequestBody.create(MediaType.parse("application/json"), json))
                .build();

        Response response = client.newCall(body).execute();
        String resBody = response.body().string();
        try {
            JSONObject ret = new JSONObject(resBody);
            ConnectionInformation.setId(ret.getInt("UserID"));
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return response.code() == 200;
    }
}
