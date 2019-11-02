var keys = {}
var lastKeys = {}
window.onkeydown = e => {
	let k = e.keyCode;
	keys[k] = true;
}

window.onkeyup = e => {
	let k = e.keyCode;
	keys[k] = false;
}
