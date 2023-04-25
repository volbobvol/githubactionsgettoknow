import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as filesize from 'filesize'

const SubmitSigningRequestTaskName = "SubmitSigningRequestAndWaitForCompletion";

export class Task{
    async run() {
        try {
            console.log('Execution started...');
        }
        catch (err) {
            console.log(err);
        }
    }
}
