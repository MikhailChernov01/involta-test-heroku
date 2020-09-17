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

//current data (hardcode db) collects here and send to every new user
let currentData = [];

//ws connection
ws.on("connection", (connection, req) => {
  const ip = req.socket.remoteAddress;
  let userID = getUniqueID();

  //send saved current data for every existing cell to new user
  if (currentData.length !== 0) {
    currentData.forEach((element) => {
      console.log(`Send ${element} for new user ${userID}`);
      connection.send(element)
    }
    )
  }
  console.log(`Connected user: ${userID}; on ip ${ip}`);

  //recieve , collect and broadcast messeges
  connection.on(`message`, (message) => {
    console.log(`Received from user ${userID}: ` + message);

    //add and update data to current data array
    if (currentData.length === 0) {
      currentData.push(message);
    } else {
      currentData.forEach((element, index) => {        
        if (JSON.parse(element).cell === JSON.parse(message).cell) {
          currentData[index] = message;
        } else {
          currentData.push(message);
        }
      });
    }

    //return unique elements in current data array
    function uniqueVal(value, index, self) {
      return self.indexOf(value) === index;
    }
    currentData = currentData.filter(uniqueVal)
    //console.log(`>>> ${currentData} `);

    for (const client of ws.clients) {
      if (client.readyState !== WebSocket.OPEN) continue;
      if (client === connection) continue;
      client.send(message);
    }
  });
  connection.on("close", () => {
    console.log(`Disconnected ${ip}`);
  });
});

app.get('/ping', function (req, res) {
  return res.send('pong');
})

//error 500 handle
app.use(function(error, req, res, next) {
  res.status(500).render('500');
});

//error 404 handle
app.use(function(req, res) {
  res.status(404).render('404');
});

//start our server
server.listen(process.env.PORT || 8000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});
