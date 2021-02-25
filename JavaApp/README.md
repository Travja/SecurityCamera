<h1 align="center">Security Camera</h1>

> Wireless camera viewing, motion detection, and notification.
# Java Application

## Install
Ensure you have Java 11+ installed. Maven is required to build the project. OpenCV is deployed internally.

Navigate to the JavaApp folder and run `mvn package` This will generate a `target/` folder. Navigate inside the `target/` folder and either run `java -jar Camera-1.0-SNAPSHOT.jar` or double click the jar file to run the application.

This jar file may be copied to another directory and run from there either.

## Configuration
The Java application will ask for configuration information on first boot and save the information to a local file. To change configuration after the fact, manually edit the file or delete it and re-run the application.

## Footage
Footage is automatically uploaded to the server. If the upload fails, footage is stored temporarily in a local `footage` directory.