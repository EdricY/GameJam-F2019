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

var portals = [];
var activePortal;


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

    activePortal = null;
    for (let p of portals) {
        if (p.update()) {
            activePortal = p;
        }
    }
    peeking = activePortal != null;

    player.update(world.cMap, keys, lastKeys, camera);
    
    if (peeking && swapFollowUpTimer == 0) { //keeps sending after they stop responding
        connection.send(newPacket(PEEKREQ));
    }

    if (swapInProgress) {
        swapTimer--;
        if (!swapMsgSent) {
            connection.send(newPacket(SWAPMSG, getSwapData()));
            swapMsgSent = true;
        }
        if (swapTimer <= 0) { //do swap!
            swapTimer = 60;
            swapFollowUpTimer = 60;
            swapInProgress = false;
            swapMsgSent = false;
            player.x = swapData.x
            player.y = swapData.y
        }
    } else if (swapFollowUpTimer > 0) swapFollowUpTimer--;
    
    if (outstandingPeekReq) {
        connection.send(newPacket(PEEKMSG, canvas.toDataURL('image/jpeg', COMPRESSION_FACTOR)))
        outstandingPeekReq = false;
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
    if (peeking && peekImgReady && swapFollowUpTimer == 0) {
        ctx.drawImage(peekImg, VW/4, VH/4, VW/2, VH/2);
        ctx.strokeStyle = "darkblue";
        ctx.strokeRect(VW/4, VH/4, VW/2, VH/2)
    } else if (!peeking) {
        peekImgReady = false;
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
        'swapTimer',
	]
	let spacing = 20;
	for (let i in properties){
		let s = properties[i];
		let displayStr = s;
		displayStr += ': ' + eval(s)
		ctx.fillText(displayStr, canvas.width - spacing, spacing + spacing*i)
	}
}



