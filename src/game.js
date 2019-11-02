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
var pumpkins = [];
var phitboxes = [];
var gravestones = [];
var zombies = [];
var hearts = [];
var winportal;


function gameInit() {
    gameState.update = gameUpdate;
    gameState.draw = gameDraw;
    player = new Player(p1sprites, p2sprites);
    camera = new Camera();
    camera.setTarget(player);

    cMapImgs = [
        cmapImg0,
        cmapImg1,
        cmapImg2,
        cmapImg3,
        cmapImg4,
        cmapImg5,
        cmapImg6,
        cmapImg7,
        cmapImg8,
    ];
    
    mapImgs = [//replace with backimgs later
        backImg0,
        backImg1,
        backImg2,
        backImg3,
        backImg4,
        backImg5,
        backImg6,
        backImg7,
        cmapImg8, //replace me
    ];

    world = new World(cMapImgs, mapImgs)
    portals.push(new Portal(60, VH/2 + 150))
    zombies.push(new Zombie(100, 600));

    console.log(portals);
    winportal = portals[0];
    for (let p of portals) {
        if (p.x > winportal.x) {
            winportal = p;
        }
    }

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

    if (isP1) {
        for (let g of gravestones) g.update();
    } else {
        for (let p of pumpkins) p.update();
    }

    for (let i = zombies.length -1; i >= 0; i--) {
        zombies[i].update(world.cMap);
        // do zombie death handling
        if (zombies[i].health <= 0) {
            zombies.splice(i, 1);
        }
    }

    for (let i = phitboxes.length - 1; i >= 0; i--) {
        phitboxes[i].hit();
        phitboxes.splice(i, 1);
    }

    for (let i = hearts.length - 1; i >= 0; i--) {
        hearts[i].update();
        if (hearts[i].collidesPlayer()) { //pickup heart
            player.health += Math.floor(Math.random() * 5) + 1;
            if (player.health > player.maxhealth) player.health = player.maxhealth;
            hearts.splice(i, 1);
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
            if (player.x > 8500 && swapData.px > 8500) {
                winGame();
            }

            isP1 = !isP1;
            swapTimer = 60;
            swapFollowUpTimer = 60;
            swapInProgress = false;
            swapMsgSent = false;

            zombies = [];
            player.x = swapData.px
            player.y = swapData.py

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
    if (isP1) {
        for (let g of gravestones) g.draw(ctx);
        for (let z of zombies) z.draw(ctx);
    }
    player.draw(ctx);

    for (let h of hearts) h.draw(ctx);

    for (let p of portals) p.draw(ctx);
    if (!isP1) {
        for (let p of pumpkins) p.draw(ctx);
    }

    // for (let h of phitboxes) h.draw(ctx);
    
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
    if (!gameWon) requestAnimationFrame(tick);
}


function drawHUD() {
    ctx.strokeStyle = "black";
    ctx.fillStyle = "red";
    let hbarPad = 20;
    ctx.fillRect(hbarPad, hbarPad, player.health, 30)
    ctx.strokeRect(hbarPad, hbarPad, VW - hbarPad*2, 30)

    // ctx.fillStyle = "yellow";
	// ctx.font = "20px serif";
	// ctx.textAlign = "right"
	// properties = [
	// 	'player.x',
	// 	'player.y',
	// 	'player.vx',
	// 	'player.vy',
    //     'player.midair',
    //     'player.animator.state',
    //     'peeking',
    //     'swapTimer',
    //     'phitboxes[0]',
	// ]
	// let spacing = 20;
	// for (let i in properties){
	// 	let s = properties[i];
	// 	let displayStr = s;
	// 	displayStr += ': ' + eval(s)
	// 	ctx.fillText(displayStr, canvas.width - spacing, spacing + spacing*i)
	// }
}



