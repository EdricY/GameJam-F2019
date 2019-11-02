var lastTime = Date.now();
var lag = 0;
var redraw = false;
var player;
var camera = new Camera();
var world;
var gameState = {
    update: function () { },
    draw: function () { },
}


function gameInit() {
    gameState.update = gameUpdate;
    gameState.draw = gameDraw;
    player = new Player(psprites);
    camera = new Camera();
    camera.setTarget(player);

    cMapImgs = [
        cmapImg1,
        cmapImg2,
        cmapImg3,
        cmapImg4,
    ];
    
    mapImgs = [
        backImg1,
        cmapImg2,//replace with backimgs later
        cmapImg3,
        cmapImg4,
    ];

    world = new World(cMapImgs, mapImgs) 

    requestAnimationFrame(tick);
}

function gameUpdate() {
    camera.update();
    player.update(world.cMap, keys, lastKeys, camera);
    lastKeys = JSON.parse(JSON.stringify(keys)); //TODO: custom deep copy
}

function gameDraw() {
    ctx.clearRect(0, 0, VW, VH);
    ctx.save();
    camera.moveCtx(ctx);

    world.draw(ctx, camera.x + VW/2)
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



