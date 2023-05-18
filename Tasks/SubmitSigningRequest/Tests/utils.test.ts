import { assert, expect } from "chai";
import { executeWithRetries } from "../utils";


/// write a unit tets for this function
it('test execute with retries', async () => {
    let counter = 0;
    const promise = async () => {
        counter++;

        if (counter < 3) {
            throw new Error('error');
        }

        return counter * 2;
    };

    const result = await executeWithRetries(promise, 100, 1, 3);

    expect(result).to.eq(6);
});
