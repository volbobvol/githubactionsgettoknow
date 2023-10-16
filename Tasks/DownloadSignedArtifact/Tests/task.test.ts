import { Task } from '../task';
import axios from 'axios';
import sinon from 'sinon';
import assert from 'assert';
import * as core from '@actions/core';

const sandbox = sinon.createSandbox();

afterEach(() => {
    sandbox.restore();
});

it('test that the task fails if the signing request status is canceled', async () => {
    sandbox.stub(core, 'getInput').returns(JSON.stringify({
        signingRequestStatus: "Canceled",
        signingRequestUiUrl: "Signing request URL"
    }));

    const setFailedStub = sandbox.stub(core, 'setFailed');
    const axiosStub = sandbox.stub(axios, 'get');
    const task = new Task();
    await task.run();
    assert.equal(setFailedStub.calledOnce, true);
    assert.equal(axiosStub.called, false);
});