import axios, { AxiosError } from 'axios';
import * as core from '@actions/core';
import * as coreArtifact from '@actions/artifact';
import * as polly from 'polly-js'
import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment';
import * as filesize from 'filesize'
import { SubmitSigningRequestResult } from './DTOs/submit-signing-request-result';
import { executeWithRetries } from './utils';
import { SignPathUrlBuilder } from './signpath-url-builder';
import { SigningRequestDto } from './DTOs/signing-request';

const MaxWaitingTimeForSigningRequestCompletionMs = 1000 * 60 * 60;
const MinDelayBetweenSigningRequestStatusChecksMs = 1000 * 60; // start from 1 min
const MaxDelayBetweenSigningRequestStatusChecksMs = 1000 * 60 * 20; // check at least every 30 minutes


export class Task {
    urlBuilder: SignPathUrlBuilder;

    constructor () {
        this.urlBuilder = new SignPathUrlBuilder(this.signPathApiUrl, this.signPathConnectorUrl);
    }

    async run() {
        try {
            core.info(`ActionRuntime: ${process.env.ACTIONS_RUNTIME_URL}`);


            const signingRequestId = await this.submitSigningRequest();
            core.setOutput('signingRequestId', signingRequestId);
            const signingRequest = await this.ensureSigningRequestCompleted(signingRequestId);
            const signedArtifactFilePath = await this.dowloadTheSigninedArtifact(signingRequest);
            await this.logArtifactFileStat(signedArtifactFilePath);
            const artifactClient = coreArtifact.create();
            core.info('Registering the signed artifact in the artifacts list...');
            artifactClient.uploadArtifact(`${this.artifactName}-signed`,
                [path.basename(signedArtifactFilePath)],
                path.dirname(signedArtifactFilePath));

            core.info('The artifact has been successfully added.');
        }
        catch (err) {
            core.error((err as any).message);
            core.setFailed((err as any).message);
        }
    }

    get signPathConnectorUrl(): string {
        return core.getInput('SignPathConnectorUrl', { required: true });
    }

    get artifactName(): string {
        return core.getInput('ArtifactName', { required: true });
    }

    get signPathApiUrl(): string {
        return core.getInput('SignPathApiUrl', { required: true });
    }

    get organizationId(): string {
        return core.getInput('OrganizationId', { required: true });
    }

    get signPathToken(): string {
        return core.getInput('CIUserToken', { required: true });
    }

    private async submitSigningRequest (): Promise<string> {

        core.info('Submitting the signing request to SignPath CI connector...');

        // prepare the payload
        const submitRequestPayload = {
            ciUserToken: this.signPathToken,
            artifactName: this.artifactName,
            gitHubApiUrl: process.env.GITHUB_API_URL,
            gitHubWorkflowRef: process.env.GITHUB_WORKFLOW_REF,
            gitHubWorkflowSha: process.env.GITHUB_WORKFLOW_SHA,
            gitHubWorkflowRunId: process.env.GITHUB_RUN_ID,
            gitHubWorkflowRunAttempt: process.env.GITHUB_RUN_ATTEMPT,
            gitHubRepository: process.env.GITHUB_REPOSITORY,
            gitHubToken: core.getInput('GitHubToken', { required: true }),
            signPathOrganizationId: this.organizationId,
            signPathProjectSlug: core.getInput('ProjectSlug', { required: true }),
            signPathSigningPolicySlug: core.getInput('SigningPolicySlug', { required: true }),
            signPathArtifactConfigurationSlug: core.getInput('ArtifactConfigurationSlug', { required: true })
        };

        // call the signPath API to submit the signing request
        const response = (await axios
            .post<SubmitSigningRequestResult>(this.urlBuilder.buildSubmitSigningRequestUrl(),
            submitRequestPayload,
            { responseType: "json" })
            .catch((e: AxiosError) => {
                core.error(`SignPath API call error: ${e.message}`);
                if(e.response?.data && typeof(e.response.data) === "string") {
                     throw new Error(e.response.data);
                }
                throw new Error(e.message);
            }))
            .data;

        if (response.error) {
            // got error from the connector
            throw new Error(response.error);
        }

        if (response.validationResult && response.validationResult.errors.length > 0) {

            // got validation errors from the connector
            core.startGroup('CI system setup validation errors')

            core.error(`[error]Build artifact \"${this.artifactName}\" cannot be signed because of continuous integration system setup validation errors:`);

            response.validationResult.errors.forEach(validationError => {
                core.error(`[error]${validationError.error}`);
                if (validationError.howToFix)
                {
                    core.info(validationError.howToFix);
                }
            });

            core.endGroup()

            throw new Error("CI system vlidation failed.");
        }

        core.info(`SignPath signing request has been successfully submitted.`);
        core.info(`You can view the signing request here: ${response.signingRequestUrl}`);

        return response.signingRequestId;
    }

    async ensureSigningRequestCompleted(signingrequestId: string): Promise<SigningRequestDto> {
        // check for status update
        const requestData = await (executeWithRetries<SigningRequestDto>(
            async () => {
                const requestStatusUrl = this.urlBuilder.buildGetSigningRequestUrl(
                    this.organizationId,
                    signingrequestId);
                const signingRequestDto = (await axios
                    .get<SigningRequestDto>(
                        requestStatusUrl,
                        {
                            responseType: "json",
                            headers: {
                                "Authorization": `Bearer ${this.signPathToken}`
                            }
                        }
                    )
                    .catch((e: AxiosError) => {
                        core.error(`SignPath API call error: ${e.message}`);
                        if(e.response?.data && typeof(e.response.data) === "string") {
                            throw new Error(JSON.stringify(
                                {
                                    'data': e.response.data
                                }));
                        }
                        throw new Error(e.message);
                    })
                    .then((response) => {
                        const data = response.data;
                        if(data && !data.isFinalStatus) {
                            core.info(`The signing request status is ${data.status}, which is not a final status; after delay, we will check again...`);
                            throw new Error('Retry signing request status check.');
                        }
                        return data;
                    }));
                return signingRequestDto;
            },
            MaxWaitingTimeForSigningRequestCompletionMs,
            MinDelayBetweenSigningRequestStatusChecksMs,
            MaxDelayBetweenSigningRequestStatusChecksMs)
            .catch((e) => {
                if(e.message.startsWith('{')) {
                    const errorData = JSON.parse(e.message);
                    return errorData.data;
                }
                throw e;
            }));

        core.info(`Signing request status is ${requestData.status}`);
        if (!requestData.isFinalStatus) {
            const maxWaitingTime = moment.utc(MaxWaitingTimeForSigningRequestCompletionMs).format("hh:mm");
            core.error(`We have exceeded the maximum waiting time, which is ${maxWaitingTime}, and the signing request is still not in a final state.`);
            throw new Error(`The signing request is not completed. The current status is "${requestData.status}`);
        } else {
            if (requestData.status !== "Completed") {
                throw new Error(`The signing request is not completed. The final status is "${requestData.status}.`);
            }
        }

        return requestData;
    }

    async dowloadTheSigninedArtifact(signingRequest: SigningRequestDto): Promise<string> {
        const workingDir = process.env.GITHUB_WORKSPACE as string;
        const fileName = `${this.artifactName}_signed.zip`;
        const targetFilePath = path.join(workingDir, fileName);

        core.info(`The signed artifact is being downloaded from SignPath and will be saved to ${targetFilePath}`);

        const writer = fs.createWriteStream(targetFilePath)
        const response = await axios.get(signingRequest.signedArtifactLink, {
            responseType: 'stream',
            headers: {
                Authorization: 'Bearer ' + this.signPathToken
            }
        });
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
        });

        core.info("The signed artifact has been successfully downloaded from SignPath.");
        return targetFilePath;
    }

    async logArtifactFileStat(artifactPath: string) {
        await fs.stat(artifactPath, (err, stats) => {
            const size = filesize.partial({base: 2, standard: "jedec"});
            core.info("File path: " + artifactPath);
            core.info("File size: " + size(stats.size));
        });
    }

}
