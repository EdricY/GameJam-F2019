class Pumpkin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.grown = false;
    this.animator = new Animator();
    let z = (Math.random() - Math.random()) * PUMPKIN_GROWTH_TIME / 5;
    let growthTime = PUMPKIN_GROWTH_TIME + z;
    let pumpkinFrames = [
      { x:13, y:38, w:35, h:21, px:39, py:55 },
      { x:62, y:26, w:53, h:32, px:99, py:56},
      { x:129, y:17, w:60, h:42, px:168, py:57 },
      // { x:10, y:70, w:89, h:51, px:54, py:119 },
    ];

    this.animator.register("grow", pumpkinFrames,
      getTimeBasedFrameSelector(growthTime, pumpkinFrames.length)
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
    if (this.animator.t > PUMPKIN_GROWTH_TIME) {
      let numHearts = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < numHearts; i++) {
        hearts.push(new Heart(this.x, this.y))
      }
      console.log('pumpkin break!')
      if (this.animator.t > PUMPKIN_GROWTH_TIME) {
      }
    }
    this.animator.t = 0;
  }
}