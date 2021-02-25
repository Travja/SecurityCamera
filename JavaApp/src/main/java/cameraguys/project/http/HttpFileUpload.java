package cameraguys.project.http;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import okhttp3.*;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;

@AllArgsConstructor
public class HttpFileUpload {

    @Getter
    @Setter
    private String url;
    @Getter
    @Setter
    private File file;
    @Getter
    @Setter
    private HashMap<String, String> formData;

    private void okSendRequest() {
        if (!url.startsWith("http"))
            url = "http://" + url;
        OkHttpClient client = new OkHttpClient().newBuilder()
                .build();
        MultipartBody.Builder builder = new MultipartBody.Builder().setType(MultipartBody.FORM);

        formData.keySet().forEach(key -> {
            builder.addFormDataPart(key, formData.get(key));
//                .addFormDataPart("name", "Travja")
//                .addFormDataPart("userEmail", "the.only.t.craft@gmail.com");
        });

        builder.addFormDataPart("path", file.getAbsolutePath(),
                RequestBody.create(MediaType.parse("application/octet-stream"),
                        file));
        MultipartBody body = builder.build();
        Request request = new Request.Builder()
                .url(url)
                .method("POST", body)
                .build();
        try {
            Response response = client.newCall(request).execute();
            System.out.println(response.body().string());
            if (response.isSuccessful()) {
                file.delete(); //Cleanup!
            } else {
                System.err.println("Email notification failed to send. Image will not be deleted.");
            }
        } catch (IOException e) {
            System.err.println("Email notification failed to send. Image will not be deleted.");
            e.printStackTrace();
        }
    }

    public void uploadImage() {
        okSendRequest();
    }

}