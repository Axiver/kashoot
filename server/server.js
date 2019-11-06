//Load dependencies
const WebSocket = require('ws');
const request = require('request');
const uuid = require('uuid/v4');
var temp;

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
function sendToClient(uuid, data) {
  console.log("findingclient");
  wss.clients.forEach(ws => {
    if (ws.id == uuid) {
      console.log("found the client");
      ws.send(data);
    }
  });
}

//Identifies the new connection
async function identifyUser(ws) {
  new Promise(function(resolve, reject) {
    //Makes sure the connection hasn't already been identified
    if (ws.id == null) {
      //Asks user if this is a reconnect
      let message = {"type": "query", "query": "identifier"};
      ws.send(JSON.stringify(message));
      //Wait 1.5s for client to respond
      setTimeout(function() {
        //If connection still has no identifier
        if (ws.id == null) {
          //Generate unique identifier for connection
          ws.id = uuid();
          temp = ws.id;
          //Send the uuid to the client
          let response = {'type': 'uuid','data': ws.id};
          ws.send(JSON.stringify(response));
          console.log(wss.clients);
          //Job done
          resolve();
        }
      }, 1500);
    } else {
      resolve();
    }
  });
}

//Pings all clients to see if they are still connected
function listClients() {
  wss.clients.forEach(function each(ws, req) {
    console.log(ws._socket.remoteAddress);
    console.log(wss.clients);
  });
}

//Verify user's captcha request
async function verifyCaptcha(secret, response) {
  new Promise(function(resolve, reject) {
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
  });
}

//--Websocket server event handlers--//
wss.on('connection', async function connection(ws) {
  //Identifies the user
  await identifyUser(ws);
  //Incoming message event handler
  ws.on('message', async data => {
    data = JSON.parse(data);
    console.log(data);
    //Authenticate user captcha
    if (data.type == "authenticate") {
      console.log("authenticating client response");
      await verifyCaptcha("", data.token);
      console.log(temp);
      let message = {"testmessage": "hello i can send to you"};
      sendToClient(temp, JSON.stringify(message));
      //Sets connection identifier to the one from the client
    } else if (data.type == "identifier") {
      console.log('hey its a identifier')
      //Check if a connection of the same identifier already exists, and is open
      wss.clients.forEach(client => {
        //Only allow this connection to have this identifier if this identifier already exists
        if (client.id == data.id) {
          //Ensure that the connection with this identifier is closed
          if (client.readyState !== client.OPEN) {
            //Assign the current connection with identifier from client
            ws.id = data.id;
            console.log(ws.id);
          }
        }
      });
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
