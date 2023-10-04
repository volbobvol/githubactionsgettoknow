import { Task } from '../task';
import axios from 'axios';
import sinon from 'sinon';
import assert from 'assert';
import * as core from '@actions/core';

const sandbox = sinon.createSandbox();

afterEach(() => {
    sandbox.restore();
});
