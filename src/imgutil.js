
//TODO: put these functions into a static class (similar to Math)

/* Creates a dictionary that maps colorstr to value
 * imageData - imageData with pixels of colors to map onto values
 * values - array of values to map pixel colors to
 */
function imageData2ColorDict(imageData, values) {
    let dict = {};
    let i = 0;
    let data = imageData.data;
    for (let row = 0; row < imageData.height; row++) {
        for (let col = 0; col < imageData.width; col++) {
            let pos = 4 * (col + row*imageData.width);
            // let colorstr = imageData.slice(pos, pos+4).toString()
            let r = data[pos];
            let g = data[pos+1];
            let b = data[pos+2];
            let a = data[pos+3];
            let colorstr = `${r},${g},${b},${a}`;
            dict[colorstr] = values[i++];
            if (i >= values.length) return dict;
        }
    }
    return dict;
}

/* img - img or canvas to convert to ColorDict
 */
function img2ColorDict(img, values) {
    return imageData2ColorDict(img2ImageData(img), values);
}

/* Creates a matrix of values corresponding to pixels in imageData 
 *   using the mapping defined in pixelDict
 * imageData - imageData with pixels of colors inside pixelDict
 * pixelDict - mapping of pixel colors to matrix values
 */
function imageData2Matrix(imageData, pixelDict, callback) {
    let matrix = [];
    let data = imageData.data;
    for (let row = 0; row < imageData.height; row++) {
        matrix.push([]);
        for (let col = 0; col < imageData.width; col++) {
            let pos = 4 * (col + row*imageData.width);
            // let colorstr = imageData.slice(pos, pos+4).toString()
            let r = data[pos];
            let g = data[pos+1];
            let b = data[pos+2];
            let a = data[pos+3];
            let colorstr = `${r},${g},${b},${a}`;
            let val = pixelDict[colorstr];
            if (val == undefined) val = null;
            matrix[row].push(val);
            callback(colorstr, col, row);
        }
    }
    return matrix;
}

/* img - img or canvas to convert to matrix
 */
function img2Matrix(img, pixelDict, callback) {
    return imageData2Matrix(img2ImageData(img), pixelDict, callback);
}

/* Creates a matrix of values corresponding to alpha values in imageData
 * imageData - imageData with pixels that have alpha values of interest
 * binary - set to true populate matrix with booleans
 *          set to false to get actual alpha values (0-255)
 */
function imageData2AlphaMatrix(imageData, binary=true) {
    let matrix = [];
    let data = imageData.data;
    for (let row = 0; row < imageData.height; row++) {
        matrix.push([]);
        for (let col = 0; col < imageData.width; col++) {
            let pos = 4 * (col + row*imageData.width);
            let a = data[pos+3];
            if (binary) {
                if (a > 0) a = true;
                else a = false;
            }
            matrix[row].push(a);
        }
    }
    return matrix;
}

function img2AlphaMatrix(img, binary=true) {
    return imageData2AlphaMatrix(img2ImageData(img), binary);
}

function spriteSheetImg2ImgArray(img, spw=32, sph=32) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = spw;
    canvas.height = sph;
    let imgs = [];
    for (let y=0; y+sph <= img.height; y+=sph) {
        for (let x=0; x+spw <= img.width; x+=spw) {
            ctx.drawImage(img, x, y, spw, sph, 0, 0, spw, sph);
            imgs.push(canvas2Img(canvas));
        }
    }
    return imgs;
}

/* img - img or canvas to convert to ImageData
 */
function img2ImageData(img) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function canvas2Img(canvas) {
    let img = document.createElement("img");
    img.src = canvas.toDataURL();
    if (img.width > 0) return img;
    console.log('cloning and returning canvas')
    let canvas2 = document.createElement("canvas");
    canvas2.width = canvas.width;
    canvas2.height = canvas.height;
    canvas2.getContext("2d").drawImage(canvas, 0, 0);
    return canvas2;

    // fixes: Uncaught DOMException: 
    // Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The source width is 0.
    // requires await... avoid using this function by passing canvas instead of img.
    // while (img.width <= 0) {
    //     console.log("try again")
    //     img = await canvas2ImgPromise(canvas, 0);
    // }
    // return img;
}

function canvas2ImgPromise(canvas, timeout) {
    let img = document.createElement("img");
    return new Promise(resolve => {
        setTimeout(() => {
            img.src = canvas.toDataURL();
            img.onload = () => { 
                resolve(img);
            }
            img.onerror = () => { console.log ('something wrong')}
        }, timeout);
    });
}


//hopefully you don't need to use this...
function ctx2Img(ctx) {
    let img = document.createElement("img");
    img.src = ctx.canvas.toDataURL();
    return img;
}