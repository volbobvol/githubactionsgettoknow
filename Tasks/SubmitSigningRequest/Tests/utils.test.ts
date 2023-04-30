import { assert, expect } from "chai";
import { signingRequestStatusCheckdDelays } from "../utils";

it('test delays generation', async () => {

    // expected result 10 + 20 + 30
    let delays = signingRequestStatusCheckdDelays(60, 10, 30);
    expect(delays).to.eql([10, 20, 30]);


    // expected result 10 + 20 + 30
    delays = signingRequestStatusCheckdDelays(60, 0, 30);
    expect(delays).to.eql([0, 1, 2, 4, 8, 16, 30]);
});

