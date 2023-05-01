import { SigningRequestStatus } from "./DTOs/signing-request";

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

export function IsFinalStatus(signingRequestStatus: SigningRequestStatus)
{
    switch (signingRequestStatus)
    {
        case SigningRequestStatus.InProgress:
        case SigningRequestStatus.WaitingForApproval:
            return false; // not final

        case SigningRequestStatus.Canceled:
        case SigningRequestStatus.Completed:
        case SigningRequestStatus.Denied:
        case SigningRequestStatus.Failed:
            return true; // final
    }
    throw new Error(`SigningRequestStatus - ${signingRequestStatus} is not supported.`);
}
