//Declarations
const server = "";

//Connects to server
var connection = new WebSocket(server);
var reconnect = true;

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

//Reconnect to the server if needed
function connect() {
	connection = new WebSocket(server);
}

function dotheshake() {
	//Do something here
}

function error(type) {
	if (type == "emptypin") {
		dotheshake();
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

//Webhook
//On connection open
connection.onopen = function() {
	console.log("Connected to server");
	connect = "";
}

//Listens for new messages
connection.onmessage = function(e) {
	console.log(e.data);
}

//Reconnect to server if disconnected
connection.onclose = function(e) {
    //Do something
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

setInterval(function() {
	if (connection.readyState !== WebSocket.OPEN) {
		reconnect = false;
		connection.close();
		console.log("Disconnected from server. Retrying...");
	  	connection = new WebSocket(server);
	} else {
		if (!reconnect) {
			reconnect = true;
			console.log("Reconnected to server.");
		}
	}
}, 5000);