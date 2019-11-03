//Functions
function changeColor(color) {
	$("body").css("background-color", "rgb(" + color + ")");
}

function cycleColor() {
	changeColor("9, 227, 24");
	setTimeout("changeColor('227, 118, 9')", 8000);
	setTimeout("changeColor('202, 227, 9')", 16000);
	setTimeout("changeColor('9, 227, 212')", 24000);
}

$(document).ready(function() {
	cycleColor();
    setInterval(cycleColor, 32000);
});
