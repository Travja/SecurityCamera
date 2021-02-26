package cameraguys.project;

import dev.onvoid.webrtc.*;
import dev.onvoid.webrtc.media.MediaDevices;
import dev.onvoid.webrtc.media.video.VideoDevice;
import dev.onvoid.webrtc.media.video.VideoDeviceSource;
import dev.onvoid.webrtc.media.video.VideoTrack;
import io.socket.client.IO;
import io.socket.client.Socket;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URI;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.logging.ConsoleHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;

public class SocketIOBroadcasterClient {

    public static void main(String[] args) {

        Logger logger = Logger.getLogger(IO.class.getName());

        Handler handlerObj = new ConsoleHandler();
        handlerObj.setLevel(Level.ALL);
        logger.addHandler(handlerObj);
        logger.setLevel(Level.ALL);
        logger.setUseParentHandlers(false);

        HashMap<String, RTCPeerConnection> peerConnections = new HashMap<>();
        PeerConnectionFactory factory = new PeerConnectionFactory();

        Socket socket = IO.socket(URI.create("http://localhost:42069"));

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
                System.out.println(objects[1]);
                JSONObject json = (JSONObject) objects[1];
                RTCSessionDescription description = new RTCSessionDescription(RTCSdpType.valueOf(json.getString("type").toUpperCase()), json.getString("sdp"));
//                RTCSessionDescription description = (RTCSessionDescription) objects[1];
                System.out.println("id:" + id);
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

            VideoDeviceSource vid = new VideoDeviceSource();
            VideoDevice device = MediaDevices.getVideoCaptureDevices().get(0);
            System.out.println(" -- CAPABILITIES -- ");
            MediaDevices.getVideoCaptureCapabilities(device).forEach(capability -> {
                System.out.println(capability);
            });

            vid.setVideoCaptureDevice(device);
            vid.setVideoCaptureCapability(MediaDevices.getVideoCaptureCapabilities(device).get(0));
            vid.start();
            VideoTrack track = factory.createVideoTrack("CAM", vid);

            peerConnection.addTrack(track, Collections.emptyList()); //Should this list be empty?

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
                                System.out.println(peerConnection.getLocalDescription());
                                String json = new JSONObject()
                                        .put("type", peerConnection.getLocalDescription().sdpType.toString().toLowerCase())
                                        .put("sdp", peerConnection.getLocalDescription().sdp)
                                        .toString();
                                System.out.println(json);
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
                System.out.println(json);
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
            peerConnections.remove(id);
        });

    }
}

