var lastTime = Date.now();
var lag = 0;
var redraw = false;
var player;
var camera = new Camera();
var world;
var peekImg;
var gameState = {
    update: function () { },
    draw: function () { },
}

var portals = [];


function gameInit(isP1) {
    let psprites;
    if (isP1) psprites = p1sprites;
    else psprites = p2sprites;

    gameState.update = gameUpdate;
    gameState.draw = gameDraw;
    player = new Player(psprites);
    camera = new Camera();
    camera.setTarget(player);

    cMapImgs = [
        cmapImg0,
        cmapImg1,
        cmapImg2,
        cmapImg3,
        cmapImg4,
        cmapImg5,
    ];
    
    mapImgs = [//replace with backimgs later
        cmapImg0,
        cmapImg1,
        backImg2,
        cmapImg3,
        cmapImg4,
        cmapImg5,
    ];

    world = new World(cMapImgs, mapImgs)

    portals.push(new Portal(60, VH/2 + 150))

    requestAnimationFrame(tick);
}

function gameUpdate() {
    camera.update();
    for (let p of portals) p.update(); //sets peeking

    player.update(world.cMap, keys, lastKeys, camera);
    
    if (peeking === true) {
        connection.send(newPacket(PEEKREQ));
    }

    lastKeys = JSON.parse(JSON.stringify(keys)); //TODO: custom deep copy
}

function gameDraw() {
    ctx.clearRect(0, 0, VW, VH);
    ctx.save();
    camera.moveCtx(ctx);

    let centerx = camera.x + VW/2;
    world.draw(ctx, centerx)
    for (let p of portals) p.draw(ctx);

    player.draw(ctx);
    ctx.restore();
    drawHUD();
    if (peeking && peekImg) {
        ctx.drawImage(peekImg, VW/4, VH/4, VW/2, VH/2);
        ctx.strokeStyle = "darkblue";
        ctx.strokeRect(VW/4, VH/4, VW/2, VH/2)
    }
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
        'peeking',
	]
	let spacing = 20;
	for (let i in properties){
		let s = properties[i];
		let displayStr = s;
		displayStr += ': ' + eval(s)
		ctx.fillText(displayStr, canvas.width - spacing, spacing + spacing*i)
	}
}



