var canvas = document.getElementById('canvas')
var ctx = canvas.getContext("2d");
// var renderer = document.getElementById('renderer')

const VW = renderer.width
const VH = renderer.height
const CW = renderer.width * 4/3
const CH = renderer.height * 4/3
const WW = Number.MAX_SAFE_INTEGER//CW * 4;
const WH = CH;

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


const STEP_UP_GRACE = 8;

const P_CROUCH_DUR = 6;
const P_LAND_DUR = 14;
const P_RUN_CYCLE_DUR = 40;
const COYOTE_DUR = 4;
const CHANNEL_DUR = 4;

//map things
const PIXELDICT = { //TODO: get from dictonary img instead
    '255,174,201,255': null,
    '255,255,255,255': 0, //only down collision
    '0,0,0,255': 1
}

PORTAL_COLOR = '163,73,164,255'


//math things
const TAU = 2 * Math.PI;

function lerp(a, b, frac) {
    let range = b-a;
    return a + (range * frac);
}

// keys
const PEEK_KEY = 16;
const UP_KEY = 87; // 38
const DN_KEY = 83; // 40
const LEFT_KEY = 65; // 37
const RGHT_KEY = 68; // 39

//messages 
const PEEKREQ = 0;
const PEEKMSG = 1;
