// requires animator.js
class Player {
    x = 100; // middle of player (right pixel)
    y = 200;  // bottom of player
    vx = 0;
    vy = -20;
    w = 32;
    hw = 32/2; //half width
    h = 80;
    ax = .6;
    jv = 0;
    fulljv = -20;
    shortjv = -13;
    // mvx = 20;
    mvy = 22;
    midairJumps = 0;
    midair = true;
    midairTimer = 0;
    animator = new Animator();
    facingRight = false;

    constructor(spriteSheet) {
        this.spriteSheet = spriteSheet;
        this.initAnimator();
        this.animator.play("midair");
    }

    animCheck(stateName) {
        return this.animator.inState(stateName);
    } 

    draw(ctx) {
        let ptop = this.y - this.h+1;
        let pleft = this.x - this.hw
        let x = Math.floor(pleft);
        let y = Math.floor(ptop);
        ctx.fillStyle = 'red';
        ctx.fillRect(x, y, this.w, this.h);
        
        let frame = this.animator.getFramePositionData(this);
        let top = this.y - (frame.py - frame.y);
        let left = this.x - (frame.px - frame.x);

        let alpha = ctx.globalAlpha;
        if (swapTimer > 0) ctx.globalAlpha = swapTimer / 60;
        if (swapFollowUpTimer > 0) ctx.globalAlpha = 1 - swapFollowUpTimer / 60;

        if (this.facingRight) {
            ctx.drawImage(this.spriteSheet, frame.x, frame.y, frame.w, frame.h, left, top, frame.w, frame.h);
        } else {
            let right = this.x + (frame.px - frame.x);
            ctx.scale(-1, 1);
            ctx.drawImage(this.spriteSheet, frame.x, frame.y, frame.w, frame.h, -right, top, frame.w, frame.h);
            ctx.scale(-1, 1);
        }

        ctx.globalAlpha = alpha;
        
    }

    update(cMap, keys, lastKeys, camera) {
        this.animator.update();
        if (!swapInProgress) { //controls (switch to "takingInput" condition)
            if (keys[LEFT_KEY]) { //left
                this.vx -= this.ax;
                // if (this.vx < -this.mvx) this.vx = -this.mvx;
                if (this.vx < 0) this.facingRight = false;
            }
            if (keys[RGHT_KEY]) { //right
                this.vx += this.ax;
                // if (this.vx > this.mvx) this.vx = this.mvx;
                if (this.vx > 0) this.facingRight = true;
            }
            if (keys[UP_KEY] && !lastKeys[UP_KEY] && this.midairTimer < COYOTE_DUR) { //up
                this.jv = this.fulljv;
                this.animator.play("jumpcrouch", t => {
                    if (t > P_CROUCH_DUR) {
                        this.jumps--;
                        this.animator.play("midair");
                        this.midair = true;
                        this.vy = this.jv;
                    }
                });
            }
            if (!keys[UP_KEY] && lastKeys[UP_KEY] && this.animCheck("jumpcrouch")) {
                //short hop
                this.jv = this.shortjv;
            }
        }
        let omidair = this.midair;
        let ovy = this.vy;
        let ovx = this.vx;
        this.vy += GRAVITY;
        if (this.vy > this.mvy) this.vy = this.mvy;
        
        //movement
        let vy = Math.round(this.vy); //maaaybe don't do this...
        let vx = Math.round(this.vx); //some precision of x and y pos (but not vel) is lost
                                      //could store values past decimal pt in another variable
        vy = Math.abs(vy);
        vx = Math.abs(vx);
        let ystride = vy / vx;
        let xtravesed = 0, ytravesed = 0, steppedUp = 0;
        this.xScoot = this.vx > 0 ? this.scootRight : this.scootLeft; //store on "this." to avoid using call()
        this.yScoot = this.vy > 0 ? this.scootDown : this.scootUp;
        let xCls, yCls;
        while (xtravesed < vx) {
            xCls = this.xScoot(cMap);
            if (xCls != null) {
                if (steppedUp < STEP_UP_GRACE) {
                    let stepHeight = this.y - xCls + 1;
                    steppedUp += stepHeight;
                    if (steppedUp > STEP_UP_GRACE) break;
                    let stepCls;
                    for (let i = 0; i < stepHeight; i++) {
                        let stepCls = this.scootUp(cMap);
                        if (stepCls != null) break;
                    }
                    if (stepCls != null) break;
                    ytravesed += stepHeight;
                    this.vx = ovx;
                } else break;
            }
            xtravesed++;
            let yCount = 0;
            while (yCount < ystride && ytravesed < vy) {
                yCls = this.yScoot(cMap);
                if (yCls != null) {
                    ytravesed = vy;
                    break;
                }
                yCount++;
                ytravesed++;
                if (vy < 0) this.midair = true;
            }
        }
        //finish out any leftover y movement
        while (ytravesed < vy && yCls == null) {
            yCls = this.yScoot(cMap);
            ytravesed++;
            if (vy < 0) this.midair = true;
        }

        if (yCls != null && ovy >= 0) { //landing
            this.jumps = 1;
            if (ovy > 8) { // hard landing
                camera.shake(4);
                this.animator.play("land", t => {
                    if (t >= P_LAND_DUR) {
                        // might be bad practice... maybe setup timers on the player instead
                        this.animator.play("stand");
                    }
                });
            } 
            // else if (!this.animCheck("land") && !this.animCheck("jumpcrouch")){
            //     this.animator.play("stand");
            // }
        }

        this.vx *= FRICTION; //maybe different value when midair? switch to lerp?
        if (Math.abs(this.vx) - .01 < 0) this.vx = 0;
        
        if (this.midair && !this.animCheck("jumpcrouch") && this.midairTimer > COYOTE_DUR)
        {
            this.animator.play("midair"); //need timeout? (custom timeout?)
        }
        
        if (!this.midair && !this.animCheck("land") && !this.animCheck("jumpcrouch")) {
            if (Math.abs(this.vx) < .5) this.animator.play("stand");
            else this.animator.play("run");
        }

        if (this.midair) this.midairTimer++;
        else this.midairTimer = 0;

        if (swapInProgress) {
            this.animator.play("swap");
        }
    }

    /* move down 1 pixel or collide
     * returns x-collision or null
     */
    scootDown(cMap) {
        let x_cls = cMap.getCollisionDown(this.y, this.x, this.hw, keys[DN_KEY]);
        //TODO: fix clinging to right edge of screen
        if (x_cls == null) {
            this.y++;
            this.midair = true;
        } else { //landed on something
            this.vy = 0;
            this.midair = false;
        }
        return x_cls;
    }

    /* move up 1 pixel or collide and 0 out this.vy
     * returns x-collision or null
     */
    scootUp(cMap) { 
        let top = this.y-this.h+1;
        let x_cls = cMap.getCollisionUp(top, this.x, this.hw);
        if (x_cls == null) {
            this.y--;
        } else { //hit your head
            this.vy = 0;
        }
        return x_cls;
    }

    /* move right 1 pixel or collide and 0 out this.vx
     * returns y-collision or null
     */
    scootRight(cMap) {
        let right = this.x+this.hw-1;
        let y_cls = cMap.getCollisionRight(right, this.y, this.h, true, keys[DN_KEY]);
        if (y_cls == null) {
            this.x++;
        } else { //hit wall
            this.vx = 0;
        }
        return y_cls;
    }

    /* move left 1 pixel or collide and 0 out this.vx
     * returns y-collision or null
     */
    scootLeft(cMap) {
        let y_cls = cMap.getCollisionLeft(this.x-this.hw, this.y, this.h, true, keys[DN_KEY]);
        if (y_cls == null) {
            this.x--;
        } else { //hit wall
            this.vx = 0;
        }
        return y_cls;
    }
    
    initAnimator() {
        let midairframes = [
            { x:384, y:249, w:92, h:127, px:436, py:375 },
        ]
        this.animator.register("midair",
            midairframes,
            t => 0
        );

        let jumpcrouchframes = [
            { x:135, y:255, w:87, h:90, px:190, py:343 },
            { x:260, y:254, w:88, h:107, px:297, py:360 },
        ];
        this.animator.register("jumpcrouch",
            jumpcrouchframes,
            getTimeBasedFrameSelector(P_CROUCH_DUR, jumpcrouchframes.length)
        );

        let landingframes = [
            { x:260, y:254, w:88, h:107, px:297, py:360 },
            { x:135, y:255, w:87, h:90, px:190, py:343 },
        ];
        this.animator.register("land",
            landingframes,
            getTimeBasedFrameSelector(P_LAND_DUR, landingframes.length)
        );

        this.animator.register("stand", [
                { x:11, y:13, w:76, h:96, px:45, py:106 },
            ],
            (() => 0) //always select frame 0
        );

        let runningFrames = [
            { x:11, y:13, w:76, h:96, px:45, py:106 },
            { x:100, y:9, w:86, h:105, px:146, py:110 },
            { x:203, y:20, w:79, h:93, px:243, py:110 },
            { x:7, y:134, w:82, h:92, px:46, py:225 },
            { x:117, y:129, w:86, h:103, px:156, py:230 },
            { x:220, y:143, w:79, h:92, px:260, py:232 },
        ];
        this.animator.register("run", runningFrames,
            getLoopingFrameSelector(P_RUN_CYCLE_DUR, runningFrames.length)
        );

        let swappingFrames = [
            { x:135, y:255, w:87, h:90, px:190, py:343 },
        ];
        this.animator.register("swap", swappingFrames,
            (t => 0)
        );
    }

}