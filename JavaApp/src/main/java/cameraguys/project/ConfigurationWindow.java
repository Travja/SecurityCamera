package cameraguys.project;

import cameraguys.project.http.ConnectionInformation;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.Node;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class ConfigurationWindow {

    @FXML
    public TextField nameField,
            emailField,
            passwordField,
            serverField,
            camNameField;

    @FXML
    public boolean testConnection(ActionEvent actionEvent) {
        String email = emailField.getText();
        String password = passwordField.getText();
        String server = serverField.getText();

        return ConnectionInformation.testConnection(server, email, password, true);
    }

    @FXML
    public void apply(ActionEvent actionEvent) {

        if (testConnection(actionEvent)) {
            File file = new File("server.conf");
            ConnectionInformation.purge();
            if (file.exists())
                file.delete();
            try (FileWriter writer = new FileWriter(new File("server.conf"))) {
                System.out.println(nameField);
                writer.write(nameField.getText() + "\n");
                writer.write(emailField.getText() + "\n");
                writer.write(passwordField.getText() + "\n");
                writer.write(serverField.getText() + "\n");
                writer.write(camNameField.getText());
            } catch (IOException e) {
                e.printStackTrace();
            }

            Stage primaryStage = new Stage();
            CameraApp.openCameraWindow(primaryStage);

            ((Stage) ((Node) actionEvent.getSource()).getScene().getWindow()).close();
        }

    }
}
