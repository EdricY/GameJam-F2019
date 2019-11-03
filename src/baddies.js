class Gravestone {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.spawnTimer = GRAVESTONE_INTERVAL;
    this.animator = new Animator();
    
    this.spawnDuration = 60;
    let graveFrames = [
      { x:20, y:27, w:46, h:49, px:43, py:76 },
      { x:79, y:28, w:41, h:49, px:99, py:76 },
      { x:133, y:23, w:54, h:58, px:165, py:76 },
    ];
    this.animator.register("spawn", graveFrames,
      getReversingFrameSelector(this.spawnDuration, graveFrames.length)
    );

    this.animator.register("idle", [{ x:20, y:27, w:46, h:49, px:43, py:76 }],
      (t => 0)
    );
    this.animator.play("idle");
  }

  update() {
    this.animator.update();
    this.spawnTimer--;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = GRAVESTONE_INTERVAL + Math.random() * GRAVESTONE_INTERVAL / 5;
      this.spawnZombie();
    }
  }

  draw(ctx) {
    let frame = this.animator.getFramePositionData(this);
    let top = this.y - (frame.py - frame.y);
    let left = this.x - (frame.px - frame.x);
    ctx.drawImage(graveImg, frame.x, frame.y, frame.w, frame.h, left, top, frame.w, frame.h);
  }

  spawnZombie() {
    //play animation => then add zombie
    this.animator.play("spawn", t => {
      if (t >= this.spawnDuration) {
        if (zombies.length < 200) {
          zombies.push(new Zombie(this.x, this.y))
        }
        this.animator.play("idle");
      }
    });
  }
}


class Zombie {
  constructor(x, y) {
    this.health = 3 + Math.floor(Math.random() * 4);
    this.hurtTimer = 0;
    this.x = x;
    this.y = y+ZOM_H;
    this.vy = -15;
    this.vx = 0;
    this.ax = .4;
    this.w = ZOM_W;
    this.h = ZOM_H;
    this.hw = ZOM_W/2;
    this.riseTimer = 0;
    this.animator = new Animator();
    this.chasing = false;
    this.timer = 600;
    this.doJump = false;
    this.facingRight = Math.random() > .5;
    this.goLeft = false;
    this.goRight = false;

    let walkFrames = [
      { x:408, y:28, w:61, h:100, px:443, py:125 },
      { x:498, y:26, w:62, h:104, px:530, py:128 },
      { x:589, y:29, w:59, h:101, px:625, py:128 }, 
    ]
    this.animator.register("walk", walkFrames,
      getLoopingFrameSelector(60, walkFrames.length)
    );
    this.animator.register("run", walkFrames,
      getLoopingFrameSelector(40, walkFrames.length)
    );
  }
  
  playerInSight() {
    let dx = player.x - this.x;
    if (Math.abs(dx) > VW/2) return false;
    let dy = player.y - this.y;
    if (Math.abs(dy) > VH/2) return false;
    // if (this.facingRight != dx >= 0) return false;

    // actually hit player (bad, I know)
    if (Math.abs(dx) < player.hw + ZOM_W/2) {
      if (Math.abs(dy) < player.h) {
        if (player.hurtTimer <= 0) {
          player.vy = -5
          player.vx = -5
          if (this.facingRight) player.vx *= -1
          player.hurtTimer = 50;
          player.health -= ZOM_DMG;
          if (player.health < 0) player.health = 0;
        }
      }
    }

    return true;
  }

  draw(ctx) {
    let frame = this.animator.getFramePositionData(this);

    let top = this.y - (frame.py - frame.y);
    let left = this.x - (frame.px - frame.x);
    let alpha = ctx.globalAlpha;
    if (this.hurtTimer > 0) {
      ctx.globalAlpha = 1 - (this.hurtTimer-- / 100);
    }

    if (this.facingRight) {
      ctx.drawImage(zombieImg, frame.x, frame.y, frame.w, frame.h, left, top, frame.w, frame.h);
    } else {
      let right = this.x + (frame.px - frame.x);
      ctx.scale(-1, 1);
      ctx.drawImage(zombieImg, frame.x, frame.y, frame.w, frame.h, -right, top, frame.w, frame.h);
      ctx.scale(-1, 1);
    }
    ctx.globalAlpha = alpha;
  }

  update(cMap) {
    this.animator.update();
    //set goLeft or goRight and doJump based on behavior
    if (this.y > WH*1.5) {
      this.health = -50;
    }
    if (this.hurtTimer <= 0) {
      if (this.chasing)
      {
        this.animator.play("run");
        this.ax = .4 - Math.random() * .2;
        if (this.timer-- <= 0) { //start wandering
          this.chasing = false;
          this.timer = 60;
          if (Math.random() > .5) {
            this.goRight = false;
            this.goLeft = true; 
          } else {
            this.goRight = true;
            this.goLeft = false;
          }
        }
        if (player.x > this.x) {
          this.goRight = true;
          this.goLeft = false;
        } else {
          this.goRight = false;
          this.goLeft = true; 
        }
      } else { //wander
        this.animator.play("walk");
        this.ax = .2;
        if (Math.random() < .01) {
          if (Math.random() < .5) {
            this.goRight = false;
            this.goLeft = true; 
          } else {
            this.goRight = true;
            this.goLeft = false;
          }
        }
        if (this.playerInSight() && this.timer-- <= 0) {
          this.chasing = true;
          this.timer = 600;
        }
      }
    } else {
      this.goRight = false;
      this.goLeft = false;
    }
    


    //handle "inputs"
    if (this.goLeft) { //left
      this.vx -= this.ax;
      // if (this.vx < -this.mvx) this.vx = -this.mvx;
      if (this.vx < 0) this.facingRight = false;
    }
    if (this.goRight) { //right
        this.vx += this.ax;
        // if (this.vx > this.mvx) this.vx = this.mvx;
        if (this.vx > 0) this.facingRight = true;
    }
    if (this.doJump) { //up
        this.jv = this.fulljv;
    }


    let ovy = this.vy;
    let ovx = this.vx;
    this.vy += GRAVITY;

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
      }
    }
    //finish out any leftover y movement
    while (ytravesed < vy && yCls == null) {
      yCls = this.yScoot(cMap);
      ytravesed++;
    }

    this.vx *= FRICTION; //maybe different value when midair? switch to lerp?
    if (Math.abs(this.vx) - .01 < 0) this.vx = 0;
  }

    /* move down 1 pixel or collide
     * returns x-collision or null
     */
  scootDown(cMap) {
    let x_cls = cMap.getCollisionDown(this.y, this.x, this.hw);
    if (x_cls == null) {
      this.y++;
    } else { //landed on something
      this.vy = 0;
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
      let y_cls = cMap.getCollisionRight(right, this.y, this.h);
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
      let y_cls = cMap.getCollisionLeft(this.x-this.hw, this.y, this.h);
      if (y_cls == null) {
          this.x--;
      } else { //hit wall
          this.vx = 0;
      }
      return y_cls;
  }
}