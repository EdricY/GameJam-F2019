const tau = 2 * Math.PI;

let partColors = ["#812", "#26C", "#262"];
Particles = {
	parts: [],
	update: function(){
		let len = this.parts.length;
		for (let i = 0; i < len; i++) {
			if (this.parts[i].update) {
				this.parts[i].update();
			}
			else {
				this.parts.splice(i--, 1);
				len--;
			}
		}
	},

	draw: function(ctx){
		for (let p of this.parts) {
			if (p.draw) p.draw(ctx);
		}
	},
	addPart: function(x, y, color){
		this.parts.push(newPart(x,y, color));
	},
  addSpiralPart: function(x, y){
		this.parts.push(newSpiralPart(x,y, color));
	},
  explode: function(x, y, color, t=20, rscale=10) {
      for (let i = 0; i < t; i++){
          this.parts.push(newPart(x, y, color, rscale));
      }
  },
	spiral: function(x, y, color, t=20, rscale=10) {
        for (let i = 0; i < t; i++){
            this.parts.push(newSpiralPart(x,y, color, rscale));
        }
    },
  sprayUp: function(x, y, color, t=1, rscale=2) {
    for (let i = 0; i < t; i++){
        this.parts.push(newSprayPart(x,y, color, rscale));
    }
  }
}

function newPart(x, y, color, rscale) {
	return {
		ox: x,
		oy: y,
		x: x,
		y: y,
		r: 1 + rscale*Math.random(),
		v: .2,
		color: color,
		theta: Math.random() * tau,
		draw: function(ctx){
			ctx.beginPath();
            let oldW = ctx.lineWidth;
			ctx.lineWidth = 1;
			ctx.fillStyle = this.color;
			ctx.arc(this.x, this.y, this.r, 0, tau);
			ctx.fill();
            ctx.closePath();
            ctx.lineWidth = oldW;
		},
		update: function(){
			this.x += this.v * this.r * Math.cos(this.theta);
			this.y += this.v * this.r * Math.sin(this.theta);
			this.r -= .1;
			if (this.r <= 0) {
				this.update = null;
				this.draw = () => {};
				return;
			}
			this.theta += .3-.6*Math.random();
		},

	}
}

function newSpiralPart(x, y, color, rscale) {
	return {
		ox: x,
		oy: y,
		x: x,
		y: y,
		r: 2 + rscale*Math.random(),
		v: 5,
		color: Math.random() > .7 ? "white" : color,
		theta: Math.random() * tau,
		draw: function(ctx){
			ctx.beginPath();
			let oldW = ctx.lineWidth;
			ctx.lineWidth = 1;
			ctx.fillStyle = this.color;
			ctx.arc(this.x, this.y, this.r, 0, tau);
			ctx.fill();
			ctx.closePath();
            ctx.lineWidth = oldW;
		},
		update: function(){
			this.x += this.r * Math.cos(this.theta);
			this.y += this.r * Math.sin(this.theta);
			this.r -= .1;
			if (this.r <= 0) {
				this.update = null;
				this.draw = () => {};
				return;
			}
			this.theta += .05;
		},

	}
}

function newSprayPart(x, y, color, rscale) {
	return {
		ox: x,
		oy: y,
		x: x + Math.random() * 60 - 30,
		y: y,
		r: 1 + rscale*Math.random(),
		v: .2,
		color: color,
		theta: -tau/4,
		draw: function(ctx){
			ctx.beginPath();
            let oldW = ctx.lineWidth;
			ctx.lineWidth = 1;
			ctx.fillStyle = this.color;
			ctx.arc(this.x, this.y, this.r, 0, tau);
			ctx.fill();
            ctx.closePath();
            ctx.lineWidth = oldW;
		},
		update: function(){
			this.x += this.v * this.r * Math.cos(this.theta);
			this.y += this.v * this.r * Math.sin(this.theta);
			this.r -= .1;
			if (this.r <= 0) {
				this.update = null;
				this.draw = () => {};
				return;
			}
			this.theta += .3-.6*Math.random();
		},

	}
}