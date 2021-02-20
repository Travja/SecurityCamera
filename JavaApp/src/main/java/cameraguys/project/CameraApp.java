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
        InputStream in = CameraApp.class.getClassLoader().getResourceAsStream("opencv_java3413.dll");
        if (!new File("lib").exists())
            new File("lib").mkdirs();
        Path path = new File("lib", "opencv_java3413.dll").toPath();
        if (!new File("lib", "opencv_java3413.dll").exists() && in != null) {
            try {
                Files.copy(in, path);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        System.load(new File("lib", "opencv_java3413.dll").getAbsolutePath());
        System.out.println("Loaded OpenCV");
        launch(args);
    }

    public static void openCameraWindow(Stage primaryStage) {

        try {
            FXMLLoader loader = new FXMLLoader(CameraApp.class.getClassLoader().getResource("ClientWindow.fxml"));
            GridPane root = loader.load();
            ClientWindow controller = loader.getController();

            Scene scene = new Scene(root);
            primaryStage.setTitle("Camera Test");
            primaryStage.setScene(scene);

            primaryStage.setOnCloseRequest(we -> controller.setClosed());
            primaryStage.show();
        } catch (IOException e) {
            e.printStackTrace();
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
}
