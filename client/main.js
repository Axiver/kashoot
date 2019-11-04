//Declarations
const server = "";

//Connects to server
var reconnect,
	connection,
	firstConnect = true;

//Functions
//Changes color of the body bg
function changeColor(color) {
	$("body").css("background-color", "rgb(" + color + ")");
}

//Invokes color changing function
function cycleColor() {
	changeColor("9, 227, 24");
	setTimeout("changeColor('227, 118, 9')", 8000);
	setTimeout("changeColor('202, 227, 9')", 16000);
	setTimeout("changeColor('9, 227, 212')", 24000);
}

function dotheshake() {
	//Do something here
}

function error(type) {
	if (type == "emptypin") {
		dotheshake();
	}
}

//Webhook
function connect() {
	//Attempt to connect to server
	if (firstConnect) {
		console.log("Connecting to server...");
  		connection = new WebSocket(server);
	} else {
		if (connection.readyState !== WebSocket.OPEN) {
			connection.close();
			console.log("Connecting to server...");
  			connection = new WebSocket(server);
  		}
	}

	//On connection open
	connection.onopen = function() {
		firstConnect = false;
		//Do the rest of the script
		console.log("Connected to server");
		clearInterval(reconnect);
	}

	//Listens for new messages
	connection.onmessage = function(e) {
		let data = JSON.parse(e.data);
		if (data.type == "uuid") {
			//Generates a date for the cookie to expire on
			let date = new Date();
			date.setDate(date.getDate() + 1);
			//Sets the cookie *om nom*
			document.cookie = "uuid=" + data.data + "; expires=" + date.toGMTString();
			console.log(data.data);
		}
	}

	//Reconnect to server if disconnected
	connection.onclose = function(e) {
	   	console.log("Connection closed, reconnecting...");
	   	connect();
	}
}

//Send to the server
async function send(data) {
	new Promise(function(resolve, reject) {
		if (connection.readyState === WebSocket.OPEN) {
			connection.send(JSON.stringify(data));
			resolve();
		} else {
			resolve('Not connected to server');
		}
	});
}

//Document ready
$(document).ready(function() {
	//Cycles the colors indefinitely
	cycleColor();
    setInterval(cycleColor, 32000);

    //Enter lobby
	$("#enter-lobby").on("click", function() {
		console.log("button clicked")
		//Get value of user input
		let game_pin = $("#game_pin").val();
		if (game_pin == "") {
			error("emptypin");
			console.log("its empty")
			return;
		}
		//Get token from google
		grecaptcha.execute('', {action: 'login'}).then(async function(token) {
	       	//Merge gamepin and captcha token into a json
	       	console.log("got token");
	       	let data = {};
	       	data.type = "authenticate";
	       	data.gamepin = game_pin;
	       	data.token = token;
	       	let result = await send(data);
	       	if (result != null) {
	       		console.log(result);
	       	}
	    });
	});
});

connect();