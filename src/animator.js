class Animator {
    constructor() { }

    /* animData: [animDatum] indexed by stateKey
     * animDatum: {frames, frameSelector}
     * frames: [framePositionData] in animation order
     * framePositionData: {x, y, w, h, px, py} or custom setup
     * frameSelector: t => framesIndex
     */
    animData = [];
    
    /* stateDict: {stateName: stateKey}
     */
    stateDict = {};
    /* The current stateKey
    */
    state = -1;
    t = 0;
    onupdate = t => {};

    update() {
        this.t++;
        if (this.onupdate == null) return;
        this.onupdate(this.t)
    }

    getFramePositionData() {
        let animDatum = this.animData[this.state];
        let index = animDatum.frameSelector(this.t, this.obj);
        let framePositionData = animDatum.frames[index];
        return framePositionData;
    }

    register(stateName, frames, frameSelector) {
        let stateKey = Object.keys(this.stateDict).length;
        this.stateDict[stateName] = stateKey;
        this.animData[stateKey] = {frames, frameSelector};
    }

    inState(stateName) {
        return this.state === this.stateDict[stateName];
    }

    /*
     * newState - dictionary key of the state to switch to
     * onupdate : function(t) - function to call on update
     */
    switchState(newState, onupdate) {
        this.state = this.stateDict[newState];
        if (this.state == undefined) this.state = newState;
        this.onupdate = onupdate;
        this.t = 0;
    }
    
    /* Starts playing or continues to play given animation
     * stateName - dictionary key of the state to switch to
     * onupdate : function(t) - function to call on update
     */
    play(stateName, onupdate) {
        if (this.inState(stateName)) return;
        this.switchState(stateName, onupdate);
    }
}

function getTimeBasedFrameSelector(duration, numFrames) {
    let perFrame = duration / numFrames;
    return (t => {
        if (t/perFrame >= numFrames) return numFrames-1;
        return Math.floor(t/perFrame);
    });
}

function getLoopingFrameSelector(duration, numFrames) {
    let perFrame = duration / numFrames;
    return (t => {
        return Math.floor(t/perFrame) % numFrames;
    });
}

function getReversingFrameSelector(duration, numFrames) {
    if (numFrames < 2) throw RangeError("numFrames should be greater than 2.")
    let b = numFrames - 1;
    numFrames = (numFrames * 2) - 2;
    let perFrame = duration / numFrames;
    return (t => {
        let x = Math.floor(t/perFrame) % numFrames;
        return b - Math.abs(b - x);
    });
}
