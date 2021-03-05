package cameraguys.project;

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
        extract("opencv_java3413.dll");

        System.load(new File("lib", "opencv_java3413.dll").getAbsolutePath());
        System.out.println("Loaded OpenCV");
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

    @Override
    public void start(Stage primaryStage) {

        try {
            if (!new File("server.conf").exists()) {
                FXMLLoader confLoader = new FXMLLoader(getClass().getClassLoader().getResource("ConfigurationWindow.fxml"));
                Parent confRoot = confLoader.load();

                primaryStage.setTitle("Configure Your Camera!");
                primaryStage.setScene(new Scene(confRoot));
                primaryStage.show();
            } else {
                openCameraWindow(primaryStage);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void openCameraWindow(Stage primaryStage) {

        try {
            FXMLLoader loader = new FXMLLoader(CameraApp.class.getClassLoader().getResource("ClientWindow.fxml"));
            GridPane root = loader.load();
            ClientWindow controller = loader.getController();

            Scene scene = new Scene(root);
            primaryStage.setTitle("Camera App");
            primaryStage.setScene(scene);

            primaryStage.setOnCloseRequest(we -> controller.setClosed());
            primaryStage.show();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }
}
