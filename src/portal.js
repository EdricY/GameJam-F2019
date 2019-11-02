class Portal {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 64;
    this.hw = this.w/2;
    this.animator = new Animator();
    this.animator.register("idle",
      [
        { x:184, y:24, w:70, h:36, px:220, py:57 },
      ],
      (t => 0)
    );
    this.animator.register("active",
      [
        { x:11, y:10, w:72, h:51, px:47, py:57 },
        { x:99, y:12, w:70, h:49, px:134, py:57 },
      ],
      getLoopingFrameSelector(40, 2)
    );
    this.animator.play("idle");
  }

  update() {
    this.animator.update();
    let dx = player.x - this.x;
    if (Math.abs(dx) > 20) {
      this.animator.play("idle");
      return null;
    }
    let dy = player.y - this.y;
    if (Math.abs(dy) > 10){
      this.animator.play("idle");
      return null;
    }
    this.animator.play("active");
    if (keys[PEEK_KEY]) return this;
    return null;
  }

  draw(ctx) {
    let frame = this.animator.getFramePositionData(this);
    let top = this.y - (frame.py - frame.y);
    let left = this.x - (frame.px - frame.x);
    ctx.drawImage(portalSprites, frame.x, frame.y, frame.w, frame.h, left, top, frame.w, frame.h);
    if (this.animator.inState("active")) {
      ctx.fillStyle = "yellow";
      ctx.font = "14px serif";
      ctx.textAlign = "center";
	  	ctx.fillText("[Shift]", this.x, this.y - player.h - 20)
    }
  }

}