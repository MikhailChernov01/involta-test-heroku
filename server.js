'use strict';

const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const favicon = require('express-favicon');
const path = require('path');


const app = express()
.use(favicon(__dirname + '/build/favicon.ico'))
.use(express.static(__dirname))
.use(express.static(path.join(__dirname, 'build')))

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const ws = new WebSocket.Server({ server });

//generates user ID
const getUniqueID = () => {
  const s4 = () =>  Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return "id" + s4() + '-' + s4();
}

//ws connection
ws.on('connection', (connection, req) => {
  const ip = req.socket.remoteAddress;
  let userID = getUniqueID();
  console.log(`Connected user: ${userID}; on ip ${ip}`);
  connection.on(`message`, message => {
    console.log(`Received from user ${userID}: ` + message);
    for (const client of ws.clients) {
      if (client.readyState !== WebSocket.OPEN) continue;
      if (client === connection) continue;
      client.send(message);
    }
  });
  connection.on('close', () => {
    console.log(`Disconnected ${ip}`);
  });
});

app.get('/ping', function (req, res) {
  return res.send('pong');
})

//start our server
server.listen(process.env.PORT || 8000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});















// app.get('/*', function (req, res) {
//     path.join(__dirname, 'build', 'index.html');
//   });






