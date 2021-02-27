package cameraguys.project;

import dev.onvoid.webrtc.*;
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
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.logging.ConsoleHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;

public class SocketIOBroadcasterClient {
    private static PeerConnectionFactory factory = new PeerConnectionFactory();
    private static AudioTrack audioTrack;
    private static VideoTrack track;
    private static VideoDeviceSource vid = new VideoDeviceSource();

    private static long time = System.currentTimeMillis();
    private static boolean killed = false;
    private static Socket socket;
    private static VideoTrackSink sink;
    private static HashMap<String, RTCPeerConnection> peerConnections = new HashMap<>();

    private static boolean cameraOn = false;
    private static int iteration = 0;
    private static Thread socketio;

    public static void main(String[] args) {

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

    private static void initSocket() {

        if (socketio != null) return;
        socketio = new Thread(() -> {
            while (!cameraOn) {
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            System.out.println("Camera is on. Connecting to Socket");

            socket = IO.socket(URI.create("http://localhost:42069"));

            socket.connect();

            socket.on("connect", objects -> {
                System.out.println("Connection: " + socket.id());
                socket.emit("broadcaster");
            });

            socket.on("connect_error", objects -> {
                Exception e = (Exception) objects[0];
                System.out.println("Connect error:" + e.getMessage());
                System.out.println("Connect error:" + Arrays.toString(e.getStackTrace()));
            });

            socket.on("error", objects -> {
                Exception e = (Exception) objects[0];
                System.out.println("Connect error:" + e.getMessage());
            });


            socket.on("disconnect", objects -> System.out.println(Arrays.toString(objects)));

            socket.on("answer", objects -> {
                try {
                    String id = objects[0].toString();
//                System.out.println(objects[1]);
                    JSONObject json = (JSONObject) objects[1];
                    RTCSessionDescription description = new RTCSessionDescription(RTCSdpType.valueOf(json.getString("type").toUpperCase()), json.getString("sdp"));
//                RTCSessionDescription description = (RTCSessionDescription) objects[1];
//                System.out.println("id:" + id);
                    peerConnections.get(id).setRemoteDescription(description, new SetSessionDescriptionObserver() {
                        @Override
                        public void onSuccess() {
                            System.out.println("remote description set");
                        }

                        @Override
                        public void onFailure(String s) {

                        }
                    });
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            });

            socket.on("watcher", objects -> {

                String id = objects[0].toString();
                System.out.println("Received watcher");

                RTCIceServer iceServer = new RTCIceServer();
                iceServer.urls.add("stun:stun.l.google.com:19302");

                RTCConfiguration config = new RTCConfiguration();
                config.iceServers.add(iceServer);

                RTCPeerConnection peerConnection = factory.createPeerConnection(config, new PeerConnectionObserver() {
                    @Override
                    public void onIceCandidate(RTCIceCandidate rtcIceCandidate) {
                        //add the stream to the track
                        try {
                            String json = new JSONObject()
                                    .put("candidate", rtcIceCandidate.sdp)
                                    .put("sdpMLineIndex", rtcIceCandidate.sdpMLineIndex)
                                    .put("sdpMid", rtcIceCandidate.sdpMid)
                                    .toString();
                            socket.emit("candidate", id, json);
                        } catch (JSONException e) {
                            System.err.println("Could not convert ICE candidate to json.");
                        }
                    }
                });

                List<String> trackIds = new ArrayList<>();
                trackIds.add(audioTrack.getId());
                trackIds.add(track.getId());

                peerConnection.addTrack(audioTrack, trackIds);
                peerConnection.addTrack(track, trackIds);

                peerConnections.put(id, peerConnection);

                RTCOfferOptions offerOptions = new RTCOfferOptions();
                peerConnection.createOffer(offerOptions, new CreateSessionDescriptionObserver() {
                    @Override
                    public void onSuccess(RTCSessionDescription rtcSessionDescription) {
                        System.out.println("Built offer");
                        peerConnection.setLocalDescription(rtcSessionDescription, new SetSessionDescriptionObserver() {
                            @Override
                            public void onSuccess() {
                                try {
                                    System.out.println("Set description");
//                                System.out.println(peerConnection.getLocalDescription());
                                    String json = new JSONObject()
                                            .put("type", peerConnection.getLocalDescription().sdpType.toString().toLowerCase())
                                            .put("sdp", peerConnection.getLocalDescription().sdp)
                                            .toString();
//                                System.out.println(json);
                                    socket.emit("offer", id, json);
                                    System.out.println("Sent offer.");
                                } catch (JSONException e) {
                                    System.err.println("Could not convert to json...");
                                    e.printStackTrace();
                                }
                            }

                            @Override
                            public void onFailure(String s) {
                                System.out.println("Failed to set description");
                            }
                        });
                    }

                    @Override
                    public void onFailure(String s) {
                        System.out.println("Failed to build offer.");
                    }
                });
            });

            socket.on("candidate", objects -> {
                try {
                    String id = objects[0].toString();
                    JSONObject json = (JSONObject) objects[1];
//                System.out.println(json);
                    RTCIceCandidate candidate = new RTCIceCandidate(json.getString("sdpMid"), json.getInt("sdpMLineIndex"), json.getString("candidate"));
//            RTCIceCandidate candidate = (RTCIceCandidate) objects[1];
                    peerConnections.get(id).addIceCandidate(candidate);
                } catch (JSONException e) {
                    System.err.println("Could not convert candidate to ICE Candidate");
                    e.printStackTrace();
                }
            });

            socket.on("disconnectPeer", objects -> {
                String id = objects[0].toString();
                peerConnections.get(id).close();
                peerConnections.remove(id);
            });
        });
        socketio.setUncaughtExceptionHandler((t, e) -> {
        });

        if (!socketio.isAlive())
            socketio.start();
    }

    public static void kill() {
        if (killed) return;
        killed = true;
        socketio.interrupt();

        peerConnections.values().forEach(conn -> {
            for (RTCRtpSender sender : conn.getSenders()) {
                conn.removeTrack(sender);
            }
            conn.close();
        });
        peerConnections.clear();

        audioTrack.dispose();
        vid.dispose();
        if (sink != null)
            track.removeSink(sink);
        track.dispose(); //TODO Crashes here... Not sure why. But it kills the app ¯\_(ツ)_/¯

        factory.dispose();
        if (socket != null)
            socket.close();

        while (Thread.activeCount() > 0) {
            Thread.currentThread().stop();
        }
    }

    public static void initDevices() {
        VideoDevice device = MediaDevices.getVideoCaptureDevices().get(0);

        System.out.println("CAPABILITIES");
        MediaDevices.getVideoCaptureCapabilities(device).forEach(cp -> System.out.println(cp));

        vid.setVideoCaptureDevice(device);
        vid.setVideoCaptureCapability(MediaDevices.getVideoCaptureCapabilities(device).get(9)); //I believe index 0 is auto-resolution
        vid.start();

        AudioOptions audioOptions = new AudioOptions();
        audioOptions.noiseSuppression = true;
        AudioSource audioSource = factory.createAudioSource(audioOptions);
        audioTrack = factory.createAudioTrack("AUDIO", audioSource);
        track = factory.createVideoTrack("CAM", vid);

        sink = videoFrame -> {
            if (System.currentTimeMillis() - time < 1000d / 10d) {
//                videoFrame.release();
                return; //Give me 30 FPS!
            }

            time = System.currentTimeMillis();

            FrameConverter.queue(videoFrame);
            if (iteration < 50) iteration++;
            if (iteration >= 50 && !cameraOn) cameraOn = true;
        };
        track.addSink(sink);
    }
}

