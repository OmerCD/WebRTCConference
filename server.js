const express = require("express");
const app = express();
var fs = require('fs');

var privateKey = fs.readFileSync('certificate.key');
var certificate = fs.readFileSync('certificate.crt');

var credentials = {key: privateKey, cert: certificate};

let broadcaster;
const broadcasters = {};
const port = 4015;

const https = require("https");
const server = https.createServer(credentials, app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on("broadcaster", (roomId) => {
    broadcasters[roomId] = socket.id;
    // broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", (roomId) => {
    socket.to(broadcasters[roomId]).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});
server.listen(port,"10.100.0.122", () => console.log(`Server is running on port ${port}`));
