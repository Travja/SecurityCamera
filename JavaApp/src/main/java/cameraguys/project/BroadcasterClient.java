package cameraguys.project;

import dev.onvoid.webrtc.*;
import io.socket.emitter.Emitter;
import io.socket.engineio.client.Socket;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URI;
import java.util.Arrays;
import java.util.HashMap;
import java.util.logging.ConsoleHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;

public class BroadcasterClient {

    public static void main(String[] args) {
        System.out.println("Starting java client.....");

        Logger logger = Logger.getLogger(Socket.class.getName());

        Handler handlerObj = new ConsoleHandler();
        handlerObj.setLevel(Level.ALL);
        logger.addHandler(handlerObj);
        logger.setLevel(Level.ALL);
        logger.setUseParentHandlers(false);


        Socket socket = new Socket(URI.create("ws://localhost:5000"));


        HashMap<String, RTCPeerConnection> peerConnections = new HashMap<>();

        PeerConnectionFactory factory = new PeerConnectionFactory();

        socket.on("open", new Emitter.Listener() {
            @Override
            public void call(Object... objects) {

                System.out.println(Arrays.toString(objects));
                System.out.println(socket);
                try {
                    String data = new JSONObject().put("event", "broadcaster").toString();
                    System.out.println(data);
                    socket.send("ping");
                    //socket.send(data);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                socket.on("message", new Emitter.Listener() {
                    @Override
                    public void call(Object... args) {

                        try {
                            JSONObject data = new JSONObject(args[0].toString());
                            String event = data.getString("event");
                            String id;
                            String message;

                            switch (event) {

                                case "watcher":

                                    id = data.getString("id");

                                    RTCIceServer iceServer = new RTCIceServer();
                                    iceServer.urls.add("stun:stun.l.google.com:19302");

                                    RTCConfiguration config = new RTCConfiguration();
                                    config.iceServers.add(iceServer);

                                    RTCPeerConnection peerConnection = factory.createPeerConnection(config, new PeerConnectionObserver() {
                                        @Override
                                        public void onIceCandidate(RTCIceCandidate rtcIceCandidate) {
                                            //add the stream to the track
                                            socket.emit("candidate", id, rtcIceCandidate);
                                        }
                                    });

                                    peerConnections.put(id, peerConnection);

                                    RTCOfferOptions offerOptions = new RTCOfferOptions();
                                    peerConnection.createOffer(offerOptions, new CreateSessionDescriptionObserver() {
                                        @Override
                                        public void onSuccess(RTCSessionDescription rtcSessionDescription) {
                                            peerConnection.setLocalDescription(rtcSessionDescription, new SetSessionDescriptionObserver() {
                                                @Override
                                                public void onSuccess() {
                                                    socket.emit("offer", id, peerConnection.getLocalDescription());
                                                }

                                                @Override
                                                public void onFailure(String s) {

                                                }
                                            });
                                        }

                                        @Override
                                        public void onFailure(String s) {
                                        }
                                    });

                                    break;

                                case "answer":
                                    id = data.getString("id");
                                    RTCSessionDescription description = (RTCSessionDescription) data.get("message");
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
                                    break;

                                case "candidate":
                                    id = data.getString("id");
                                    RTCIceCandidate candidate = (RTCIceCandidate) data.get("message");
                                    peerConnections.get(id).addIceCandidate(candidate);
                                    break;

                                case "disconnectPeer":
                                    id = data.getString("id");
                                    peerConnections.remove(id);
                                    break;
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                });

            }
        });

        socket.on(Socket.EVENT_ERROR, new Emitter.Listener() {
            @Override
            public void call(Object... objects) {
                Exception e = (Exception) objects[0];
                System.out.println("Connect error: " + e.getMessage());
                e.printStackTrace();
            }
        });

        socket.open();

    }

}
