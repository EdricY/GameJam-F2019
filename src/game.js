var lastTime = Date.now();
var lag = 0;
var redraw = false;
var player;
var camera = new Camera();
var gameState = {
    update: function () { },
    draw: function () { },
}

// cMaps = [];

function gameInit() {
    gameState.update = gameUpdate;
    gameState.draw = gameDraw;
    player = new Player(psprites);
    camera = new Camera();
    camera.setTarget(player);

    // cMap = new CollisionMap(img2AlphaMatrix(areaCanvas));
    cmapImg = cmapImg1;
    cMap = new CollisionMap(img2Matrix(cmapImg, PIXELDICT));
    cMaps = [
        new CollisionMap(img2Matrix(cmapImg1, PIXELDICT)),
        new CollisionMap(img2Matrix(cmapImg2, PIXELDICT)),
        new CollisionMap(img2Matrix(cmapImg3, PIXELDICT)),
        new CollisionMap(img2Matrix(cmapImg4, PIXELDICT)),
    ];
    mapImgs = [
        cmapImg1,
        cmapImg2,
        cmapImg3,
        cmapImg4,
    ];
    
    requestAnimationFrame(tick);
}

function gameUpdate() {
    camera.update();
    player.update(cMap, keys, lastKeys, camera);
    lastKeys = JSON.parse(JSON.stringify(keys)); //TODO: custom deep copy
}

function gameDraw() {
    ctx.clearRect(0, 0, VW, VH);
    ctx.save();
    camera.moveCtx(ctx);

    // let imgL = cMaps 
    ctx.drawImage(cmapImg, 0, 0);
    player.draw(ctx);
    ctx.restore();
    drawHUD();
}


function tick() {
    let current = Date.now();
    let elapsed = current - lastTime;
    lastTime = current;
    lag += elapsed;
    while (lag >= MS_PER_UPDATE) {
        gameState.update();
        lag -= MS_PER_UPDATE;
        redraw = true;
    }
    if (redraw) {
        gameState.draw();
        redraw = false;
    }
    requestAnimationFrame(tick);
}


function drawHUD() {
	ctx.fillStyle = "yellow";
	ctx.font = "20px serif";
	ctx.textAlign = "right"
	properties = [
		'player.x',
		'player.y',
		'player.vx',
		'player.vy',
        'player.midair',
        'player.animator.state',
	]
	let spacing = 20;
	for (let i in properties){
		let s = properties[i];
		let displayStr = s;
		displayStr += ': ' + eval(s)
		ctx.fillText(displayStr, canvas.width - spacing, spacing + spacing*i)
	}
}



