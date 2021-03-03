package cameraguys.project.socketio;

import cameraguys.project.http.ConnectionInformation;
import io.socket.client.IO;
import io.socket.client.Socket;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.util.logging.ConsoleHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;

public class SocketIOBroadcaster {
    private final ConnectionInformation connInfo = ConnectionInformation.load();

    public void start() {

        Logger logger = Logger.getLogger(IO.class.getName());
        Handler handlerObj = new ConsoleHandler();
        handlerObj.setLevel(Level.ALL);
        logger.addHandler(handlerObj);
        logger.setLevel(Level.ALL);
        logger.setUseParentHandlers(false);

        initSocket();

    }

    private void initSocket() {
        String url = connInfo.getUrl();
        if (!url.startsWith("http"))
            url = "http://" + url;

        try {
            url = ConnectionInformation.getFinalURL(new URL(url)).toString();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
        System.out.println("Attempting to connect to socket on " + url);
        Socket socket = IO.socket(URI.create(url));
        SocketIO.setSocket(socket);

        socket.connect();

        socket.on("connect", SocketIO.onConnect);
        socket.on("disconnect", SocketIO.disconnect);

        socket.on("connect_error", objects -> {
            Exception e = (Exception) objects[0];
            System.out.println("Connect error:" + e.getMessage());
            e.printStackTrace();
        });

        socket.on("error", objects -> {
            Exception e = (Exception) objects[0];
            System.out.println("Connect error:" + e.getMessage());
            e.printStackTrace();
        });
    }

    /**
     * Kills the Socket.io stuff and kills the application
     */
    public void kill() {
        SocketIO.clearConnections();

        if (SocketIO.getSocket() != null) {
            SocketIO.getSocket().disconnect();
        }
    }
}

