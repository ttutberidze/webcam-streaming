import io from 'socket.io-client';
import {useState, useEffect, useRef, useCallback} from 'react';

const peerConnections = {};
const config = {
  iceServers: [
    {
      "urls": "stun:stun.l.google.com:19302",
    },
  ]
};

const Broadcast = () => {
  const [socket, setSocket] = useState(null);
  const videoRef = useRef(null);

  const gotStream = useCallback((stream) => {
    videoRef.current.srcObject = stream;

    socket.emit("broadcaster");
  }, [videoRef, socket])

  const getStream = useCallback(() => {
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => {
        track.stop();
      });
    }

    const constraints = {
      video: {video: {width: 600}}
    };
    return navigator.mediaDevices
      .getUserMedia(constraints)
      .then(gotStream)
      .catch((e) => {
        console.log(e.message)
      });
  }, [videoRef, gotStream])

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:4000`);
    setSocket(newSocket);
    return () => newSocket.close();
  }, [setSocket]);

  useEffect(() => {
    if (socket) {
      socket.on("answer", (id, description) => {
        peerConnections[id].setRemoteDescription(description);
      });
      socket.on("watcher", id => {
        const peerConnection = new RTCPeerConnection(config);
        peerConnections[id] = peerConnection;

        let stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream)
        });

        peerConnection.onicecandidate = event => {
          if (event.candidate) {
            socket.emit("candidate", id, event.candidate);
          }
        };

        peerConnection
          .createOffer()
          .then(sdp => peerConnection.setLocalDescription(sdp))
          .then(() => {
            socket.emit("offer", id, peerConnection.localDescription);
          });
      });

      socket.on("candidate", (id, candidate) => {
        peerConnections[id]
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch(e => console.log(e))
      });

      socket.on("disconnectPeer", id => {
        peerConnections[id].close();
        delete peerConnections[id];
      });

      getStream()
    }
  }, [socket, getStream]);

  return (
    <video ref={videoRef} playsInline autoPlay muted />
  )
}

export default Broadcast