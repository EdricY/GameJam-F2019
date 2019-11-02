class Pumpkin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.grown = false;
    this.animator = new Animator();
    let pumpkinFrames = [
      { x:1, y:25, w:39, h:25, px:23, py:47},
      { x:58, y:18, w:49, h:32, px:77, py:47},
      { x:106, y:21, w:49, h:29, px:131, py:47},
      { x:157, y:18, w:53, h:32, px:184, py:47},
      { x:263, y:10, w:50, h:40, px:292, py:47},
      { x:319, y:1, w:58, h:49, px:347, py:47},
      { x:373, y:0, w:49, h:50, px:400, py:47},
    ];

    this.animator.register("grow", pumpkinFrames,
      getTimeBasedFrameSelector(PUMPKIN_GROWTH_TIME, pumpkinFrames.length)
    );
    this.animator.play("grow");
  }

  draw(ctx) {
    let frame = this.animator.getFramePositionData(this);
    let top = this.y - (frame.py - frame.y);
    let left = this.x - (frame.px - frame.x);
    ctx.drawImage(pumpkinSprites, frame.x, frame.y, frame.w, frame.h, left, top, frame.w, frame.h);
  }

  update() {
    this.animator.update();
  }

  break() {
    this.animator.t = 0;
    if (this.animator.t > PUMPKIN_GROWTH_TIME) {
      console.log('pumpkin break!')
    }
  }
}