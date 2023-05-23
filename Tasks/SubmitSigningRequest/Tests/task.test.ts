import { Task } from '../task';
import axios from 'axios';
import sinon from 'sinon';
import assert from 'assert';
import { expect } from 'chai';
import * as core from '@actions/core';
import { SubmitSigningRequestResult } from '../DTOs/submit-signing-request-result';
import { clear } from 'console';
/*
it('test that the task fails if the signing request submit fails', async () => {
    const sandbox = sinon.createSandbox();
    const signingRequest = {
        error: 'Failed'
    };
    sandbox.stub(core, 'getInput').returns("test");
    const setFailedStub = sandbox.stub(core, 'setFailed');
    const errorLogStub = sandbox.stub(core, 'error');
    const axiosStub = sandbox.stub(axios, 'post').resolves({ data: signingRequest });
    const task = new Task();
    await task.run();
    assert.equal(setFailedStub.calledOnce, true);
    assert.equal(errorLogStub.called, true);
    sandbox.restore();
});


it('test that the task fails if the signing request has "Failed" as a final status', async () => {
    const sandbox = sinon.createSandbox();
    sandbox.stub(core, 'getInput').returns("test");
    const setFailedStub = sandbox.stub(core, 'setFailed')
        .withArgs(sinon.match((value:any) => {
            return value.includes('TEST_FAILED')
            && value.includes('The signing request is not completed.');
        }));
    const errorLogStub = sandbox.stub(core, 'error');
    const axiosPostStub = sandbox.stub(axios, 'post').resolves({ data: {}});
    const axiosGetStub = sandbox.stub(axios, 'get').resolves({ data: {
        status: 'TEST_FAILED',
        isFinalStatus: true
    }});
    const task = new Task();
    await task.run();
    assert.equal(setFailedStub.calledOnce, true, 'setFailed should be called once');
    assert.equal(errorLogStub.called, true, 'error should be called');
    sandbox.restore();
});

it('test that the signing request was not submitted due to validation errors', async () => {
    const sandbox = sinon.createSandbox();
    const signingRequest = {
        validationResult: {
            errors: [
                {
                    error: 'TEST_ERROR',
                    howToFix: 'TEST_FIX'
                }
            ]
        }
    };
    sandbox.stub(core, 'getInput').returns("test");
    const setFailedStub = sandbox.stub(core, 'setFailed')
        .withArgs(sinon.match((value:any) => {
            return value.includes('CI system vlidation failed');
        }));
    const errorLogStub = sandbox.stub(core, 'error')
        .withArgs(sinon.match((value:any) => {
            return value.includes('TEST_ERROR');
        }));
    const infoLogStub = sandbox.stub(core, 'info')
        .withArgs(sinon.match((value:any) => {
            return value.includes('TEST_FIX');
        }));
    const axiosStub = sandbox.stub(axios, 'post').resolves({ data: signingRequest });
    const task = new Task();
    await task.run();
    assert.equal(setFailedStub.calledOnce, true);
    assert.equal(errorLogStub.called, true);
    assert.equal(infoLogStub.called, true);
    sandbox.restore();
});


*/