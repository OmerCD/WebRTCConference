let peerConnection;
const config = {
  // iceTransportPolicy: 'relay',
  iceServers: [
    {
      urls:'turns:stream2.akademi360.com:5349',
      username:'omercd',
      credential:'123456'
    },
      { 
        "urls": "stun:stun.l.google.com:19302",
      }
  ]
};
function onWatchClick(){
const socket = io.connect(window.location.origin);
const video = document.querySelector("video");
const enableAudioButton = document.querySelector("#enable-audio");

enableAudioButton.addEventListener("click", enableAudio)

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
    video.srcObject = event.streams[0];
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
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  socket.emit("watcher", document.getElementById("roomId").value);
});

socket.on("broadcaster", () => {
  socket.emit("watcher");
});
}
window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};

function enableAudio() {
  console.log("Enabling audio")
  video.muted = false;
}
