package cameraguys.project;

import cameraguys.project.http.ConnectionInformation;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.layout.GridPane;
import javafx.stage.Stage;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

public class CameraApp extends Application {

    public static void main(String[] args) {
        System.out.println("Starting application. If this is all you see.... I have no idea what's wrong.");
        launch(args);
    }

    public static void extract(String dllName) {
        InputStream in = CameraApp.class.getClassLoader().getResourceAsStream(dllName);
        if (!new File("lib").exists())
            new File("lib").mkdirs();
        Path path = new File("lib", dllName).toPath();
        if (!new File("lib", dllName).exists() && in != null) {
            try {
                Files.copy(in, path);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public static void openCameraWindow(Stage primaryStage) {
        try {
            ConnectionInformation info = ConnectionInformation.load();
            boolean connected = ConnectionInformation.testConnection(info.getUrl(), info.getEmail(), info.getPassword(), false);

            extract("opencv_java3413.dll");

            System.load(new File("lib", "opencv_java3413.dll").getAbsolutePath());
            System.out.println("Loaded OpenCV");

            if (connected) {
                FXMLLoader loader = new FXMLLoader(CameraApp.class.getClassLoader().getResource("ClientWindow.fxml"));
                GridPane root = loader.load();
                ClientWindow controller = loader.getController();

                Scene scene = new Scene(root);
                primaryStage.setTitle("Camera App");
                primaryStage.setScene(scene);

                primaryStage.setOnCloseRequest(we -> controller.setClosed());
                primaryStage.show();
            } else {
                showConfigurationWindow(primaryStage);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void showConfigurationWindow(Stage primaryStage) {
        try {
            FXMLLoader confLoader = new FXMLLoader(CameraApp.class.getClassLoader().getResource("ConfigurationWindow.fxml"));
            Parent confRoot = confLoader.load();

            primaryStage.setTitle("Configure Your Camera!");
            primaryStage.setScene(new Scene(confRoot));
            System.out.println("Showing configuration window");
            primaryStage.show();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void start(Stage primaryStage) {
        if (!new File("server.conf").exists()) {
            System.out.println("Server configuration doesn't exist.");
            showConfigurationWindow(primaryStage);
        } else {
            System.out.println("Opening camera window");
            openCameraWindow(primaryStage);
        }
    }
}
