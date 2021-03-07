package cameraguys.project.http;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import okhttp3.*;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;

@AllArgsConstructor
public class HttpFileUpload {

    @Getter
    @Setter
    private String url,
    formName;
    @Getter
    @Setter
    private File file;
    @Getter
    @Setter
    private HashMap<String, Object> formData;

    /**
     * Sends an email to the current user with the attached file.
     */
    private boolean okSendRequest() {
        ConnectionInformation info = ConnectionInformation.load();

        if (!url.startsWith("http"))
            url = "http://" + url;

        try {
            url = ConnectionInformation.getFinalURL(new URL(url)).toString();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }


        OkHttpClient client = new OkHttpClient().newBuilder()
                .build();
        MultipartBody.Builder builder = new MultipartBody.Builder().setType(MultipartBody.FORM);

        formData.keySet().forEach(key -> builder.addFormDataPart(key, formData.get(key).toString()));

        builder.addFormDataPart(formName, file.getAbsolutePath(),
                RequestBody.create(MediaType.parse("application/octet-stream"),
                        file));
        MultipartBody body = builder.build();
        Request request = new Request.Builder()
                .url(url)
                .method("POST", body)
                .build();
        try {
            Response response = client.newCall(request).execute();
            if (!response.isSuccessful()) {
                System.err.println("File upload failed: " + response.code() + ". " + response.body().string());
            }
            boolean success = response.isSuccessful();
            response.body().close();
            response.close();
            return success;
        } catch (IOException e) {
            System.err.println("Could not upload file!");
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Uploads the image and sends it in an email to the user.
     */
    public boolean uploadImage() {
        return okSendRequest();
    }

}
