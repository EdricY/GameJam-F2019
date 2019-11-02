var canvas = document.getElementById('canvas')
var ctx = canvas.getContext("2d");
// var renderer = document.getElementById('renderer')

const VW = renderer.width
const VH = renderer.height
const WW = renderer.width * 4/3
const WH = renderer.height * 4/3

//game state
const UPDATES_PER_SEC = 60;
const MS_PER_UPDATE = 1000 / UPDATES_PER_SEC;
var lag = 0;
var redraw = false;


//player things

const GRAVITY = 1;
const FRICTION = .90; //unsure exactly why, but... 
                      //player max ground speed == 1000 * (1 - FRICTION) * player.ax 
                      // Maybe should switch to lerp model?


const STEP_UP_GRACE = 16;

const P_CROUCH_DUR = 6;
const P_LAND_DUR = 14;
const COYOTE_DUR = 4;

//map things
const PIXELDICT = {
    '255,174,201,255': null,
    '255,255,255,255': 0, //only down collision
    '0,0,0,255': 1
}


//math things
const TAU = 2 * Math.PI;

function lerp(a, b, frac) {
    let range = b-a;
    return a + (range * frac);
}
