package cameraguys.project.socketio;

import cameraguys.project.ClientWindow;
import cameraguys.project.http.ConnectionInformation;
import dev.onvoid.webrtc.PeerConnectionFactory;
import dev.onvoid.webrtc.media.MediaDevices;
import dev.onvoid.webrtc.media.audio.AudioOptions;
import dev.onvoid.webrtc.media.audio.AudioSource;
import dev.onvoid.webrtc.media.audio.AudioTrack;
import dev.onvoid.webrtc.media.video.VideoDevice;
import dev.onvoid.webrtc.media.video.VideoDeviceSource;
import dev.onvoid.webrtc.media.video.VideoTrack;
import dev.onvoid.webrtc.media.video.VideoTrackSink;
import io.socket.client.IO;
import io.socket.client.Socket;

import java.net.URI;
import java.util.Arrays;
import java.util.logging.ConsoleHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;

public class SocketIOBroadcasterClient {
    private static Socket socket;
    private ConnectionInformation connInfo = ConnectionInformation.load();
    private PeerConnectionFactory factory = new PeerConnectionFactory();
    private AudioTrack audioTrack;
    private VideoTrack track;
    private VideoTrackSink sink;
    private VideoDeviceSource vid = new VideoDeviceSource();
    private boolean killed = false;
    private boolean cameraOn = false;

    private long time = System.currentTimeMillis();
    private int iteration = 0;

//    private static Thread socketio;

    public static Socket getSocket() {
        return socket;
    }

    public void start() {

        killed = false;
        Logger logger = Logger.getLogger(IO.class.getName());
        Handler handlerObj = new ConsoleHandler();
        handlerObj.setLevel(Level.ALL);
        logger.addHandler(handlerObj);
        logger.setLevel(Level.ALL);
        logger.setUseParentHandlers(false);


        initDevices();
        initSocket();

    }

    private void initSocket() {
        String url = connInfo.getUrl();
        if (!url.startsWith("http"))
            url = "http://" + url;
        System.out.println("Attempting to connect to socket on " + url);
        socket = IO.socket(URI.create(url));

        socket.connect();

        socket.on("connect", objects -> socket.emit("broadcaster"));
        socket.on("answer", SocketIO.answerListener);
        socket.on("watcher", SocketIO.watcherListener);
        socket.on("candidate", SocketIO.candidate);
        socket.on("disconnectPeer", SocketIO.disconnectPeer);
        socket.on("disconnect", objects -> System.out.println(Arrays.toString(objects)));

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
     * Stops the SocketIO connection and turns off video
     */
    public void halt() {
        if (vid != null)
            vid.stop();

        SocketIO.clearConnections();

        socket.close();
    }

    /**
     * Kills the WebRTC and Socket.io stuff and kills the application
     */
    public void kill() {
        if (killed) return;
        killed = true;
//        socketio.interrupt();

        SocketIO.clearConnections();

        if (audioTrack != null)
            audioTrack.dispose();
        if (track != null) {
            if (sink != null)
                track.removeSink(sink);
            vid.stop();
            track.dispose();
        }
        if (factory != null)
            factory.dispose();


        if (socket != null)
            socket.close();

        System.exit(0); //Lol! This is one way to do it :P

//        vid.dispose();//TODO Crashes here... Not sure why. But it kills the app ¯\_(ツ)_/¯
    }

    public void initDevices() {
        VideoDevice device = MediaDevices.getVideoCaptureDevices().get(0);

//        System.out.println("CAPABILITIES");
//        MediaDevices.getVideoCaptureCapabilities(device).forEach(cp -> System.out.println(cp));

        vid.setVideoCaptureDevice(device);
        vid.setVideoCaptureCapability(MediaDevices.getVideoCaptureCapabilities(device).get(9)); //I believe index 0 is auto-resolution, 17 is 1280x720 @ 10fps
        vid.start();

        AudioOptions audioOptions = new AudioOptions();
        audioOptions.noiseSuppression = true;
        AudioSource audioSource = factory.createAudioSource(audioOptions);
        audioTrack = factory.createAudioTrack("AUDIO", audioSource);
        track = factory.createVideoTrack("CAM", vid);

        sink = videoFrame -> {
            if (System.currentTimeMillis() - time < 1000d / ClientWindow.fps) {
                return; //Give me 30 FPS! ;(
            }

            time = System.currentTimeMillis();

            FrameConverter.queue(videoFrame);
            if (iteration < 50) iteration++;
            if (iteration >= 50 && !cameraOn) cameraOn = true;
        };
        track.addSink(sink);
    }

    public AudioTrack getAudioTrack() {
        return audioTrack;
    }

    public VideoTrack getVideoTrack() {
        return track;
    }

    public PeerConnectionFactory getFactory() {
        return factory;
    }
}

