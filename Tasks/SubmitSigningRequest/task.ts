import axios, { AxiosError } from 'axios';
import * as core from '@actions/core'
import * as polly from 'polly-js'
import { SubmitSigningRequestResult } from './DTOs/submit-signing-request-result';

export class Task{
    async run() {
        try {
            core.info('Execution started...');
            const connectorUrl = core.getInput('SignPathconnectorUrl', { required: true });
            const artifactName = core.getInput('ArtifactName', { required: true });

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

                signPathOrganizationId: core.getInput('OrganizationId', { required: true }),
                signPathProjectSlug: core.getInput('ProjectSlug', { required: true }),
                signPathSigningPolicySlug: core.getInput('SigningPolicySlug', { required: true }),
                signPathArtifactConfigurationSlug: core.getInput('ArtifactConfigurationSlug', { required: true })
            };

            const response = (await axios
                .post<SubmitSigningRequestResult>(connectorUrl /*+ 'api/sign'*/,
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
                // polly.default()
                //     .waitAndRetry(1)
                //     .executeForPromise(() => async () => {

                //     })
                //     .then(() => {

                //     })
                //     .catch(() => {

                //     })
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
