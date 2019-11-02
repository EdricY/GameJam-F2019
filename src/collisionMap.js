class CollisionMap {
    constructor(collMatrix) {
        this.collMatrix = collMatrix;
    }

    getPixel(x, y) {
        return this.collMatrix[y][x];
    }

    // returns x pos of collision or null
    getCollisionDown(bottom, x, halfwidth) {
        let r = Math.round(bottom) + 1; //row below bottom
        if (r >= WH || r < 0) return null;       //world borders
        x = Math.round(x) - halfwidth;  //left
        //should pass in keys, but too lazy
        for (let c = x; c < x + halfwidth*2; c++) {
            let val = this.collMatrix[r][c];
            if (val == 1 || (val === 0 && !keys[83])) {
                return c;
            }
        }
        return null;
    }

    // returns x pos of collision or null
    getCollisionUp(top, x, halfwidth) {
        let r = Math.round(top) - 1;    //row above top
        if (r >= WH || r < 0) return null;       //world borders
        x = Math.round(x) - halfwidth;  //left
        for (let c = x; c < x + halfwidth*2; c++) {
            if (this.collMatrix[r][c] == 1) {
                return c;
            }
        }
        return null;
    }

    // returns y pos of collision or null
    getCollisionRight(right, y, height, doStepUp=false) {
        let c = Math.round(right) + 1;  //col after right
        if (c >= WW) return null; //world right
        y = Math.round(y);              //bottom
        for (let r = y-height+1; r <= y; r++) { //scan downward to find highest collision
            if (r < 0 || r >= WH) return null;
            let val = this.collMatrix[r][c];
            if (val == 1) return r;
            if (doStepUp && r > y - STEP_UP_GRACE && val === 0 && !keys[83]) {
                return r;
            } 
        }
        return null;
    }

    // returns y pos of collision or null
    getCollisionLeft(left, y, height, doStepUp=false) {
        let c = Math.round(left) - 1;   //col before left
        if (c < 0) return null;   //screen left
        y = Math.round(y);              //bottom
        for (let r = y-height+1; r <= y; r++) { //scan downward
            if (r < 0 || r >= WH) return null;
            let val = this.collMatrix[r][c];
            if (val == 1) return r;
            if (doStepUp && r > y - STEP_UP_GRACE && val === 0 && !keys[83]) {
                return r;
            } 
        }
        return null;
    }
}