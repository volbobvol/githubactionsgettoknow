import axios, { AxiosError } from 'axios';
import * as core from '@actions/core';
import * as coreArtifact from '@actions/artifact';
import * as fs from 'fs';
import * as filesize from 'filesize'
import * as path from 'path';

export class Task {

    async run() {
        try {

            if(this.signingRequestStatus !== 'Completed') {
                core.error(`The signing request is not completed yet. The current status is ${this.signingRequestStatus}.`);
                core.info(`See the request details here: ${this.signingRequestUiUrl}.`);
                core.setFailed(`The signing request is not completed yet.`);
                return;
            }

            const signedArtifactFilePath = await this.dowloadTheSigninedArtifact();
            await this.logArtifactFileStat(signedArtifactFilePath);

            if (this.artifactName) {
                const artifactClient = coreArtifact.create();
                core.info('Registering the signed artifact in the artifacts list...');
                artifactClient.uploadArtifact(`${this.artifactName}-signed`,
                    [path.basename(signedArtifactFilePath)],
                    path.dirname(signedArtifactFilePath));

                core.info('The artifact has been successfully added.');
            }
        }
        catch (err) {
            core.error((err as any).message);
            core.setFailed((err as any).message);
        }
    }

    get signedArtifactUrl(): string {
        return core.getInput('SignedArtifactUrl', { required: true });
    }

    get authenticationToken(): string {
        return core.getInput('AuthenticationToken', { required: true });
    }

    get target(): string {
        return core.getInput('Target', { required: true });
    }

    get artifactName(): string {
        return core.getInput('ArtifactName', { required: true });
    }

    get signingRequestUiUrl(): string {
        return core.getInput('SigningRequestUiUrl', { required: true });
    }

    get signingRequestStatus(): string {
        return core.getInput('SigningRequestStatus', { required: true });
    }

    async dowloadTheSigninedArtifact(): Promise<string> {

        core.info(`The signed artifact is being downloaded from SignPath and will be saved to ${this.target}.`);

        const writer = fs.createWriteStream(this.target)
        const response = await axios.get(this.signedArtifactUrl, {
            responseType: 'stream',
            headers: {
                Authorization: 'Bearer ' + this.authenticationToken
            }
        });
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
        });

        core.info("The signed artifact has been successfully downloaded from SignPath.");
        return this.target;
    }

    async logArtifactFileStat(artifactPath: string) {
        await fs.stat(artifactPath, (err, stats) => {
            const size = filesize.partial({base: 2, standard: "jedec"});
            core.info("File path: " + artifactPath);
            core.info("File size: " + size(stats.size));
        });
    }
}
