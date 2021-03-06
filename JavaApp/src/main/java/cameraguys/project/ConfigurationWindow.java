package cameraguys.project;

import cameraguys.project.http.HttpAuthenticate;
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
            serverField,
            camNameField;

    @FXML
    public boolean testConnection(ActionEvent actionEvent) {
        //TODO Test the connection
        boolean connected = false;
        try {
            connected = new HttpAuthenticate(serverField.getText() + "/api/login", emailField.getText(), passwordField.getText()).authenticate();

            if (connected) {
                Alert alert = new Alert(Alert.AlertType.INFORMATION);
                alert.setHeaderText("Connection successful!");
                alert.setContentText("You're good to go! The connection succeeded!");
                alert.showAndWait();
            } else {
                Alert alert = new Alert(Alert.AlertType.ERROR);
                alert.setHeaderText("Could not connect");
                alert.setContentText("Authentication failed.");
                alert.showAndWait();
            }
        } catch (IOException e) {
            System.err.println("Could not execute auth check: " + e.getCause());
            e.printStackTrace();
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setHeaderText("Could not connect");
            alert.setContentText("Could not establish a connection to the server.");
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
