import {useState, useEffect, useRef} from 'react';
import io from 'socket.io-client';

let peerConnection;
const config = {
  iceServers: [
    {
      "urls": "stun:stun.l.google.com:19302",
    },
  ]
};


const Watch = () => {
  const [socket, setSocket] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:4000`);
    setSocket(newSocket);
    return () => {
      newSocket.close()
      peerConnection.close();
    };
  }, [setSocket]);

  useEffect(() => {
    if (socket) {
      socket.on("offer", (id, description) => {
        peerConnection = new RTCPeerConnection(config);
        peerConnection
          .setRemoteDescription(description)
          .then(() => peerConnection.createAnswer())
          .then(sdp => peerConnection.setLocalDescription(sdp))
          .then(() => {
            socket.emit("answer", id, peerConnection.localDescription);
          });
        peerConnection.ontrack = event => {
          videoRef.current.srcObject = event.streams[0];
        };
        peerConnection.onicecandidate = event => {
          if (event.candidate) {
            socket.emit("candidate", id, event.candidate);
          }
        };
      });

      socket.on("candidate", (id, candidate) => {
        peerConnection
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch(e => console.log(e));
      });

      socket.on("connect", () => {
        socket.emit("watcher");
      });

      socket.on("broadcaster", () => {
        socket.emit("watcher");
      });
    }
  }, [socket]);

  return (
    <video ref={videoRef} playsInline autoPlay muted/>
  )
}

export default Watch