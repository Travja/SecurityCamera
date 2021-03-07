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

/**
 * Merely defines {@link Listener}s to be used as part of SocketIO.
 * The Listeners here provide broadcaster/watcher relays to establish
 * a WebRTC peer connection.
 */
public class SocketIO {

    public static Map<String, RTCPeerConnection> peerConnections = new HashMap<>();
    public static String roomId = "defaultRoomId";

    public static Listener answerListener = objects -> {
        try {
            String id = objects[0].toString();
            JSONObject json = (JSONObject) objects[1];
            RTCSessionDescription description = new RTCSessionDescription(RTCSdpType.valueOf(json.getString("type").toUpperCase()), json.getString("sdp"));

            if (peerConnections.containsKey(id)) {
                RTCPeerConnection conn = peerConnections.get(id);
                if (conn != null && conn.getRemoteDescription() != null && conn.getRemoteDescription().equals(description))
                    return;
            }

            peerConnections.get(id).setRemoteDescription(description, new SetSessionDescriptionObserver() {
                @Override
                public void onSuccess() {
                    System.out.println("remote description set");
                }

                @Override
                public void onFailure(String s) {
                    System.out.println("remote description failure");
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
        }
    };

    public static Listener watcherListener = objects -> {
        String id = objects[0].toString();
        if (peerConnections.containsKey(id)) return;
        System.out.println("Received watcher");

        RTCIceServer stunServer = new RTCIceServer();
        stunServer.urls.add("stun:stunserver.org:3478");

        RTCIceServer turnServer = new RTCIceServer();
        turnServer.urls.add("stun:stunserver.org:3478");
        turnServer.username = "ypatel@student.neumont.edu";
        turnServer.password = "Camera_yp";


        RTCConfiguration config = new RTCConfiguration();
        config.iceServers.add(stunServer);
        config.iceServers.add(turnServer);

        RTCPeerConnection peerConnection = ClientWindow.inst().getSocket().getFactory().createPeerConnection(config, (PeerConnectionObserver) rtcIceCandidate -> {
            //add the stream to the track
            try {
                String json = new JSONObject()
                        .put("candidate", rtcIceCandidate.sdp)
                        .put("sdpMLineIndex", rtcIceCandidate.sdpMLineIndex)
                        .put("sdpMid", rtcIceCandidate.sdpMid)
                        .toString();
                SocketIOBroadcasterClient.getSocket().emit("candidate", id, json, roomId, true);
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
                            String json = new JSONObject()
                                    .put("type", peerConnection.getLocalDescription().sdpType.toString().toLowerCase())
                                    .put("sdp", peerConnection.getLocalDescription().sdp)
                                    .toString();
                            SocketIOBroadcasterClient.getSocket().emit("offer", id, json, roomId);
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
        RTCPeerConnection conn = peerConnections.get(id);
        if (conn == null) {
            peerConnections.remove(id);
            return;
        }
        for (RTCRtpSender sender : conn.getSenders()) {
            conn.removeTrack(sender);
        }
        conn.close();
        peerConnections.remove(id);
    };

    public static Listener candidate = objects -> {
        try {
            boolean isBroadcast = Boolean.parseBoolean(objects[2].toString());
            if (!isBroadcast) {
                String id = objects[0].toString();
                JSONObject json = (JSONObject) objects[1];
                RTCIceCandidate candidate = new RTCIceCandidate(json.getString("sdpMid"), json.getInt("sdpMLineIndex"), json.getString("candidate"));
                peerConnections.get(id).addIceCandidate(candidate);
            }
        } catch (JSONException e) {
            System.err.println("Could not convert candidate to ICE Candidate");
            e.printStackTrace();
        }
    };

    public static void clearConnections() {
        if (SocketIOBroadcasterClient.getSocket() != null) {
            SocketIOBroadcasterClient.getSocket().disconnect();
            SocketIOBroadcasterClient.getSocket().close();
        }
        peerConnections.values().forEach(conn -> {
            for (RTCRtpSender sender : conn.getSenders()) {
                conn.removeTrack(sender);
            }
            conn.close();
        });
        peerConnections.clear();
    }

}
