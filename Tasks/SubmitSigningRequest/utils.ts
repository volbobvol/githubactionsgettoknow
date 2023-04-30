
export function signingRequestStatusCheckdDelays(maxTotalWaitngTimeMs: number, minDelayMs: number, maxDelayMs: number): number[] {
 const delays = [];
 let totalDelay = 0;
 let currentDelay = minDelayMs;

 while(totalDelay < maxTotalWaitngTimeMs) {
    // add nextDely
    delays.push(currentDelay);
    totalDelay += currentDelay;

    // imncrease dely
    currentDelay *= 2;

    if (currentDelay === 0) {
        currentDelay = 1;
    }

    if (currentDelay > maxDelayMs) {
        currentDelay = maxDelayMs;
    }
 }

 return delays;
}