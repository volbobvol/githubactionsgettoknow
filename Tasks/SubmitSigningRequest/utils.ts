/// function that retries promise calls with delays
/// the delays are incremental and are calculated as follows:
/// 1. start with minDelay
/// 2. double the delay on each iteration
/// 3. stop when maxTotalWaitngTimeMs is reached
/// 4. if maxDelayMs is reached, use it for all subsequent calls
export async function executeWithRetries<RES>(
    promise: () => Promise<RES>,
    maxTotalWaitngTimeMs: number, minDelayMs: number, maxDelayMs: number): Promise<RES> {
    const startTime = Date.now();
    let delayMs = minDelayMs;
    let result: RES;
    while (true) {
        try {
            result = await promise();
            break;
        }
        catch (err) {
            if (Date.now() - startTime > maxTotalWaitngTimeMs) {
                throw err;
            }
            console.log(`Next check in ${delayMs/1000/60} minte(s)`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            delayMs = Math.min(delayMs * 2, maxDelayMs);
        }
    }
    return result;
}