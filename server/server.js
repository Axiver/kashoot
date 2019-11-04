//Load dependencies
const WebSocket = require('ws');
const request = require('request');
const uuid = require('uuid/v4');

//Create websocket server
const wss = new WebSocket.Server({ port: 5555 });

//--Functions--//

//Broadcasts data to every connected client
function broadcast(data) {
	wss.clients.forEach(ws => {
		ws.send(data.data);
	});
}

//Sends data to a specfic client
function sendToClient(data) {
  wss.clients.filter()
}

//Pings all clients to see if they are still connected
function listClients() {
  wss.clients.forEach(function each(ws, req) {
    console.log(ws._socket.remoteAddress);
  });
}

//Verify user's captcha request
function verifyCaptcha(secret, response) {
  //Cofigure post options for google captcha authentication
  const options = {
    uri: 'https://www.google.com/recaptcha/api/siteverify',
    method: 'POST',
    formData: {
      secret: secret,
      response: response
    }
  }
  //Send post request to google
  request(options, function(error, response, body) {
    if (error != null) {
      console.log(error);
      return;
    }
    result = JSON.parse(body);
    console.log("got back from google");
    if (result.success) {
      if (result.score > 0.6) {
        if (result.action == "login") {
          //Send lobby details to client
          console.log("all tests passed");
        } else {
          console.log("action isnt login");
        }
      } else {
        //Request for challenge
        console.log("challenge the client");
      }
    } else {
      console.log(result["error-codes"]);
    }
  });
}

//--Websocket server event handlers--//
wss.on('connection', function connection(ws) {
  //Generate unique identifier for connection
  ws.id = uuid();
  //Send the uuid to the client
  let response = {'type': 'uuid','data': ws.id};
  ws.send(JSON.stringify(response));
  //Incoming message event handler
  ws.on('message', data => {
    data = JSON.parse(data);
    console.log(data);
    //Authenticate user captcha
    if (data.type == "authenticate") {
      console.log("authenticating client response");
      verifyCaptcha("", data.token);
    }
  });
  //When client closes connection
  ws.on('close', data => {
    //Do somewthing
  });
});

//--Misc functions--//
console.log("loaded");

setInterval(listClients, 5000);
