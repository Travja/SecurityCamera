package cameraguys.project.socketio;

import cameraguys.project.ClientWindow;
import dev.onvoid.webrtc.*;
import dev.onvoid.webrtc.media.audio.AudioTrack;
import dev.onvoid.webrtc.media.video.VideoTrack;
import io.socket.emitter.Emitter.Listener;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SocketIO {

    public static Map<String, RTCPeerConnection> peerConnections = new HashMap<>();

    public static Listener answerListener = objects -> {
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
    };

    public static Listener watcherListener = objects -> {

        String id = objects[0].toString();
        System.out.println("Received watcher");

        RTCIceServer iceServer = new RTCIceServer();
        iceServer.urls.add("stun:stun.l.google.com:19302");

        RTCConfiguration config = new RTCConfiguration();
        config.iceServers.add(iceServer);

        RTCPeerConnection peerConnection = ClientWindow.inst().getSocket().getFactory().createPeerConnection(config, (PeerConnectionObserver) rtcIceCandidate -> {
            //add the stream to the track
            try {
                String json = new JSONObject()
                        .put("candidate", rtcIceCandidate.sdp)
                        .put("sdpMLineIndex", rtcIceCandidate.sdpMLineIndex)
                        .put("sdpMid", rtcIceCandidate.sdpMid)
                        .toString();
                SocketIOBroadcasterClient.getSocket().emit("candidate", id, json);
            } catch (JSONException e) {
                System.err.println("Could not convert ICE candidate to json.");
            }
        });

        AudioTrack audioTrack = ClientWindow.inst().getSocket().getAudioTrack();
        VideoTrack track = ClientWindow.inst().getSocket().getVideoTrack();

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
                            SocketIOBroadcasterClient.getSocket().emit("offer", id, json);
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
    };

    public static Listener disconnectPeer = objects -> {
        String id = objects[0].toString();
        peerConnections.get(id).close();
        peerConnections.remove(id);
    };

    public static Listener candidate = objects -> {
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
    };


    public static void clearConnections() {
        peerConnections.values().forEach(conn -> {
            for (RTCRtpSender sender : conn.getSenders()) {
                conn.removeTrack(sender);
            }
            conn.close();
        });
        peerConnections.clear();
    }

}
