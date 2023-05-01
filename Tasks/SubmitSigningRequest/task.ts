import axios, { AxiosError } from 'axios';
import * as core from '@actions/core'
import * as polly from 'polly-js'
import * as moment from 'moment';
import { SubmitSigningRequestResult } from './DTOs/submit-signing-request-result';
import { signingRequestStatusCheckdDelays } from './utils';
import { SignPathUrlBuilder } from './signpath-url-builder';
import { SigningRequestDto } from './DTOs/signing-request';

const MaxWaitingTimeForSigningRequestCompletionMs = 1000 * 60 * 60;
const MinDelayBetweenSigningRequestStatusChecksMs = 1000 * 60; // start from 1 min
const MaxDelayBetweenSigningRequestStatusChecksMs = 1000 * 60 * 20; // check at least every 30 minutes


export class Task{
    async run() {
        try {
            core.info('Execution started...');
            const connectorUrl = core.getInput('SignPathConnectorUrl', { required: true });
            const artifactName = core.getInput('ArtifactName', { required: true });
            const signPathApiBaseUrl = core.getInput('SignPathApiUrl', { required: true });
            const signPathOrganizationId = core.getInput('OrganizationId', { required: true });
            const urlBuilder = new SignPathUrlBuilder(signPathApiBaseUrl, connectorUrl);

            core.info('Submitting the signing request to the CI connector...');

            const submitRequestPayload = {
                ciUserToken: core.getInput('CIUserToken', { required: true }),
                artifactName,

                gitHubApiUrl: process.env.GITHUB_API_URL,
                gitHubWorkflowRef: process.env.GITHUB_WORKFLOW_REF,
                gitHubWorkflowSha: process.env.GITHUB_WORKFLOW_SHA,
                gitHubWorkflowRunId: process.env.GITHUB_RUN_ID,
                gitHubWorkflowRunAttempt: process.env.GITHUB_RUN_ATTEMPT,
                gitHubRepository: process.env.GITHUB_REPOSITORY,
                gitHubToken: core.getInput('GitHubToken', { required: true }),

                signPathOrganizationId,
                signPathProjectSlug: core.getInput('ProjectSlug', { required: true }),
                signPathSigningPolicySlug: core.getInput('SigningPolicySlug', { required: true }),
                signPathArtifactConfigurationSlug: core.getInput('ArtifactConfigurationSlug', { required: true })
            };

            const response = (await axios
                .post<SubmitSigningRequestResult>(urlBuilder.buildSubmitSigningRequestUrl(),
                submitRequestPayload,
                { responseType: "json" })
                .catch((e: AxiosError) => {
                    if(e.response?.data && typeof(e.response.data) === "string") {
                        throw new Error(e.response.data);
                    }
                    throw new Error(e.message);
                }))
                .data;

            if (response.error) {
                throw new Error(response.error);
            }

            if (response.validationResult && response.validationResult.errors.length > 0) {

                core.startGroup('CI system setup validation errors')

                core.error(`[error]Build artifact \"${artifactName}\" cannot be signed because of continuous integration system setup validation errors:`);

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

            if (response.signingRequestId) {
                core.info('SignPath signing request has been successfully submitted.');
                core.info(`You can view the signing request here: ${response.signingRequestUrl}`);
                core.setOutput('signingRequestId', response.signingRequestId);

                // check for status update
                const requestData = await polly.default()
                  .waitAndRetry(signingRequestStatusCheckdDelays(
                    MaxWaitingTimeForSigningRequestCompletionMs,
                    MinDelayBetweenSigningRequestStatusChecksMs,
                    MaxDelayBetweenSigningRequestStatusChecksMs
                  ))
                  .executeForPromise(async () => {
                    core.info('Checking SignPath signing request status...');
                    return await axios
                      .get<SigningRequestDto>(
                        urlBuilder.buildGetSigningRequestUrl(signPathOrganizationId, response.signingRequestId),
                       { responseType: "json" })
                       .then(res => {
                         if(!res.data.isFinalStatus) {
                            core.info(`The signing request status is ${res.data.signingRequestStatus}, which is not a final status; after delay, we will check again...`);
                            throw new Error(`Status ${res.data.signingRequestStatus} is not a final status, we need to check again.`);
                         }
                         return res.data;
                       });
                  });

                if (!requestData.isFinalStatus) {
                    const maxWaitingTime = moment.utc(MaxWaitingTimeForSigningRequestCompletionMs).format("hh:mm");
                    core.error(`We have exceeded the maximum waiting time, which is ${maxWaitingTime}, and the signing request is still not in a final state.`);
                    core.error(`Signing request status is ${requestData.signingRequestStatus}`);
                    throw new Error('Incomplete signing request');
                } else {
                    core.debug('');
                }

            }
            else {
                throw new Error('Invalid submit signing request result.');
            }

        }
        catch (err) {
            core.setFailed((err as any).message);
        }
    }
}
