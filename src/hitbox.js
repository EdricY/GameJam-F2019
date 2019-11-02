class Hitbox {
  // x - middle, y - bottom
  constructor(x, y, w, h, facingRight) {
    this.x = x - w/2;
    this.y = y - h;
    this.w = w;
    this.h = h;
    this.cx = x;
    this.cy = y;
    this.done = false;
    this.facingRight = facingRight;
  }

  draw(ctx) { //only for debug
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }

  hit() {
    for (let p of pumpkins) {
      let dx = Math.abs(this.cx - p.x);
      let dy = Math.abs(this.cy - p.y);
      if (dx > this.w) continue;
      if (dy > this.h) continue;
      p.break();
    }
    let numHit = 0;
    for (let z of zombies) {
      let dx = Math.abs(this.cx - z.x);
      let dy = Math.abs(this.cy - z.y);
      if (dx > this.w) continue;
      if (dy > this.h) continue;
      // hit
      numHit++
      z.vy = -10;
      z.vx = -20 + Math.random() * 10 - numHit;
      if (z.vx > 0) z.vx = 0;
      if (this.facingRight) z.vx *= -1;
      z.health--;
      z.hurtTimer = 50;
      z.chasing = true;
      camera.shake(10);
    }
    this.done = true;
  }
}