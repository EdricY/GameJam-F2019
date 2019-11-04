class Camera {
    xAnchor = 0;
    yAnchor = 0;
    x = this.xAnchor;
    y = this.yAnchor;

    vel = 5;

    xShakeFactor = 0;
    yShakeFactor = 0;
    xShakeSeed = 0;
    yShakeSeed = 0;
    shake(amplitude) {
        let z1 = (Math.random() - Math.random()) * amplitude / 5;
        let z2 = (Math.random() - Math.random()) * amplitude / 5;
        this.xShakeFactor = amplitude + z1;
        this.yShakeFactor = amplitude + z2;
        let rand = Math.random();
        this.xShakeSeed = rand * TAU;
        this.yShakeSeed = rand * TAU;
    }

    setTarget(obj) {
        this.target = obj;
    }

    update() {
        if (this.xShakeFactor > 0)  {
            let now = Date.now();
            this.x = this.xAnchor + this.xShakeFactor * Math.sin(this.xShakeSeed-now);
            this.y = this.yAnchor + this.yShakeFactor * Math.cos(this.yShakeSeed-now);
            this.xShakeFactor *= .9;
            this.yShakeFactor *= .9;

            if (this.xShakeFactor < .5) {
                this.xShakeFactor = 0;
                this.yShakeFactor = 0;
            }
        }

        
        let dx = this.xAnchor - this.x;
        let dy = this.yAnchor - this.y;
        
        if (this.xShakeFactor <= 0) {
            if (Math.abs(dx) < .001) this.x = this.xAnchor;
            if (Math.abs(dy) < .001) this.y = this.yAnchor;
        }

        this.x += dx/2//Math.sign(dx) * this.vel;
        this.y += dy/2//Math.sign(dy) * this.vel;

        if (this.target == null) return;
        // this.xAnchor = this.target.x - VW/2;
        // this.yAnchor = this.target.y - 3*VH/4;
        dx = this.target.x - this.xAnchor;
        dy = this.target.y - this.yAnchor;
        if      (dx > .6 * VW) this.xAnchor += dx - .6 * VW; //right
        else if (dx < .3 * VW) this.xAnchor += dx - .3 * VW; //left
        if      (dy > .7 * VH) this.yAnchor += dy - .7 * VH; //down
        else if (dy < .4 * VH) this.yAnchor += dy - .4 * VH; //up
    }

    moveCtx(ctx) {
        ctx.translate(-Math.round(this.x), -Math.round(this.y));
    }
}