import { Task } from '../task';
import axios from 'axios';
import sinon from 'sinon';
import assert from 'assert';
import * as core from '@actions/core';

const sandbox = sinon.createSandbox();

afterEach(() => {
    sandbox.restore();
});

// it('test that the task fails if the signing request submit fails', async () => {
//     const signingRequest = {
//         error: 'Failed'
//     };
//     sandbox.stub(core, 'getInput').returns("test");
//     const setFailedStub = sandbox.stub(core, 'setFailed');
//     const errorLogStub = sandbox.stub(core, 'error');
//     const axiosStub = sandbox.stub(axios, 'post').resolves({ data: signingRequest });
//     const task = new Task();
//     await task.run();
//     assert.equal(setFailedStub.calledOnce, true);
//     assert.equal(errorLogStub.called, true);
// });


// it('test that the signing request was not submitted due to validation errors', async () => {
//     const signingRequest = {
//         validationResult: {
//             errors: [
//                 {
//                     error: 'TEST_ERROR',
//                     howToFix: 'TEST_FIX'
//                 }
//             ]
//         }
//     };
//     sandbox.stub(core, 'getInput').returns("test");
//     const setFailedStub = sandbox.stub(core, 'setFailed')
//         .withArgs(sinon.match((value:any) => {
//             return value.includes('CI system vlidation failed');
//         }));
//     const errorLogStub = sandbox.stub(core, 'error')
//         .withArgs(sinon.match((value:any) => {
//             return value.includes('TEST_ERROR');
//         }));
//     const infoLogStub = sandbox.stub(core, 'info')
//         .withArgs(sinon.match((value:any) => {
//             return value.includes('TEST_FIX');
//         }));
//     const axiosStub = sandbox.stub(axios, 'post').resolves({ data: signingRequest });
//     const task = new Task();
//     await task.run();
//     assert.equal(setFailedStub.calledOnce, true);
//     assert.equal(errorLogStub.called, true);
//     assert.equal(infoLogStub.called, true);
// });