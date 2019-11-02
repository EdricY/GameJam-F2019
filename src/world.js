class World {
    constructor(collisionImgs, backImgs) {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        canvas.width = collisionImgs.length * CW;
        canvas.height = CH;
        for (let i = 0; i < collisionImgs.length; i++) {
            let cImg = collisionImgs[i];
            ctx.drawImage(cImg, i * CW, 0);
        }
        let imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.cMap = new CollisionMap(imageData2Matrix(imagedata, PIXELDICT, this.specialPixelHandler)); //maybe pass in imagedata?
        this.backImgs = backImgs;
    }

    draw(ctx, px) {
        let idx = Math.floor((px / CW) - .5);
        let img1 = this.backImgs[idx];
        let img2 = this.backImgs[idx + 1];
        if (img1 != null) ctx.drawImage(img1, CW * idx, 0);
        if (img2 != null) ctx.drawImage(img2, CW * (idx + 1), 0);
    }

    specialPixelHandler(colorstr, x, y) {
        if (colorstr == PORTAL_COLOR) portals.push(new Portal(x, y));
        if (colorstr == PUMPKIN_COLOR) pumpkins.push(new Pumpkin(x, y));
    }
}