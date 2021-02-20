package cameraguys.project;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.Node;
import javafx.scene.control.Alert;
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
            serverField;

    @FXML
    public boolean testConnection(ActionEvent actionEvent) {
        //TODO Test the connection
        boolean connected = true;

        if (connected) {
            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.setHeaderText("Connection successful!");
            alert.setContentText("You're good to go! The connection succeeded!");
            alert.showAndWait();
        } else {
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setHeaderText("Could not connect");
            alert.setContentText("It appears that some of the information your entered is incorrect. We could not establish a connection to the server.");
            alert.showAndWait();
        }

        return connected;
    }

    @FXML
    public void apply(ActionEvent actionEvent) {

        if (testConnection(actionEvent)) {
            try (FileWriter writer = new FileWriter(new File("server.conf"))) {
                System.out.println(nameField);
                writer.write(nameField.getText() + "\n");
                writer.write(emailField.getText() + "\n");
                writer.write(passwordField.getText() + "\n");
                writer.write(serverField.getText());
            } catch (IOException e) {
                e.printStackTrace();
            }

            Stage primaryStage = new Stage();
            CameraApp.openCameraWindow(primaryStage);

            ((Stage) ((Node) actionEvent.getSource()).getScene().getWindow()).close();
        }

    }
}
