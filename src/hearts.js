class Heart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vy = -10 + Math.random() * 5;
    this.vx = (Math.random() - Math.random()) * 5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= .9;
    this.vy *= .9;
  }

  draw(ctx) {
    ctx.drawImage(heartImg, this.x - HEART_W/2, this.y - HEART_H/2)
  }

  collidesPlayer() {
    if (Math.abs(this.vx) > .2) return
    if (Math.abs(this.vy) > .2) return
    let dx = player.x - this.x;
    let dy = player.y - this.y;

    if (Math.abs(dx) < player.hw + HEART_W/2) {
      if (Math.abs(dy) < player.h+HEART_H) {
        Particles.explode(this.x, this.y, "red", 8, 4)
        return true;
      }
    }

    return false;
  }

}