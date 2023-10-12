import axios, { AxiosError } from 'axios';
import * as core from '@actions/core';
import * as coreArtifact from '@actions/artifact';
import * as fs from 'fs';
import * as filesize from 'filesize'
import * as path from 'path';
import { SigningRequestData } from './DTOs/signing-request-data';

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

    get signingRequestData(): SigningRequestData {
        const input = core.getInput('SigningRequestData', { required: true });
        return JSON.parse(input) as SigningRequestData;
    }

    get signedArtifactUrl(): string {
        return this.signingRequestData.artifactDownloadUrl;
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
        return this.signingRequestData.signingRequestUiUrl;
    }

    get signingRequestStatus(): string {
        return this.signingRequestData.signingRequestStatus;
    }

    async dowloadTheSigninedArtifact(): Promise<string> {

        core.info(`The signed artifact URL is ${this.signedArtifactUrl}`);

        const authorizationHeader = 'Bearer ' + this.authenticationToken;

        const response = await axios.get(this.signedArtifactUrl, {
            responseType: 'stream',
            headers: { Authorization: authorizationHeader }
        });

        const fileName = this.target ?? this.getFileNameFromContentDisposition(response.headers['Content-Disposition']);
        core.info(`The signed artifact is being downloaded from SignPath and will be saved to ${fileName} .`);
        const writer = fs.createWriteStream(fileName);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
        });

        core.info("The signed artifact has been successfully downloaded from SignPath.");
        return fileName;
    }

    getFileNameFromContentDisposition(contentDisposition: string): string {
        const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = fileNameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
            return matches[1].replace(/['"]/g, '');
        }
        return 'signed-artifact.zip';
    }

    async logArtifactFileStat(artifactPath: string) {
        await fs.stat(artifactPath, (err, stats) => {
            const size = filesize.partial({base: 2, standard: "jedec"});
            core.info("File path: " + artifactPath);
            core.info("File size: " + size(stats.size));
        });
    }
}
