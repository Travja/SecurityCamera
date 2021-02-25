package cameraguys.project;

import dev.onvoid.webrtc.*;
import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

import java.net.URI;
import java.util.Arrays;
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

        Socket socket = IO.socket(URI.create("http://localhost:5000"));

        socket.connect();

        socket.on("connection", objects -> {
            System.out.println("Connection: " + socket.id());
            socket.emit("broadcaster");
        });

        socket.on("connect_error", new Emitter.Listener() {
            @Override
            public void call(Object... objects) {
                Exception e = (Exception) objects[0];
                System.out.println("Connect error:" + e.getMessage());
                System.out.println("Connect error:" + Arrays.toString(e.getStackTrace()));
            }
        });

        socket.on("error", new Emitter.Listener() {
            @Override
            public void call(Object... objects) {
                Exception e = (Exception) objects[0];
                System.out.println("Connect error:" + e.getMessage());
            }
        });


        socket.on("disconnect", objects ->{
            System.out.println(Arrays.toString(objects));
        });

        socket.on("answer", objects -> {
            String id = objects[0].toString();
            RTCSessionDescription description = (RTCSessionDescription) objects[1];
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
        });

        socket.on("watcher", objects -> {

            String id = objects[0].toString();

            RTCIceServer iceServer = new RTCIceServer();
            iceServer.urls.add("stun:stun.l.google.com:19302");

            RTCConfiguration config = new RTCConfiguration();
            config.iceServers.add(iceServer);

            RTCPeerConnection peerConnection= factory.createPeerConnection(config, new PeerConnectionObserver() {
                @Override
                public void onIceCandidate(RTCIceCandidate rtcIceCandidate) {
                    //add the stream to the track
                    socket.emit("candidate",id,rtcIceCandidate);
                }
            });

            peerConnections.put(id,peerConnection);

            RTCOfferOptions offerOptions = new RTCOfferOptions();
            peerConnection.createOffer(offerOptions,new CreateSessionDescriptionObserver() {
                @Override
                public void onSuccess(RTCSessionDescription rtcSessionDescription) {
                    peerConnection.setLocalDescription(rtcSessionDescription, new SetSessionDescriptionObserver() {
                        @Override
                        public void onSuccess() {
                            socket.emit("offer",id, peerConnection.getLocalDescription());
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
        });

        socket.on("candidate", objects -> {
            String id = objects[0].toString();
            RTCIceCandidate candidate = (RTCIceCandidate) objects[1];
            peerConnections.get(id).addIceCandidate(candidate);
        });

        socket.on("disconnectPeer", objects -> {
            String id = objects[0].toString();
            peerConnections.remove(id);
        });

    }
}

