import axios, { AxiosError } from 'axios';
import * as core from '@actions/core';
import { SubmitSigningRequestResult } from './DTOs/submit-signing-request-result';
import { SignPathUrlBuilder } from './../Common/signpath-url-builder';

export class Task {
    urlBuilder: SignPathUrlBuilder;

    constructor () {
        this.urlBuilder = new SignPathUrlBuilder(this.signPathConnectorUrl);
    }

    async run() {

        try {
            const signingRequestId = await this.submitSigningRequest();
            core.setOutput('signingRequestId', signingRequestId);
        }
        catch (err) {
            core.setFailed((err as any).message);
        }
    }

    get signPathConnectorUrl(): string {
        return core.getInput('SignPathConnectorUrl', { required: true });
    }

    get artifactName(): string {
        return core.getInput('ArtifactName', { required: true });
    }

    get organizationId(): string {
        return core.getInput('OrganizationId', { required: true });
    }

    get signPathToken(): string {
        return core.getInput('SignPathApiUserToken', { required: true });
    }

    get projectSlug(): string {
        return core.getInput('ProjectSlug', { required: true });
    }

    get signingPolicySlug(): string {
        return core.getInput('SigningPolicySlug', { required: true });
    }

    get artifactConfigurationSlug(): string {
        return core.getInput('ArtifactConfigurationSlug', { required: true });
    }

    get workflowRunId(): string {
        return core.getInput('WorkflowRunId', { required: true });
    }

    get downloadArtifactWorkflowName(): string {
        return core.getInput('DownloadArtifactWorkflowName', { required: false });
    }

    get artifactContext(): string {
        return core.getInput('ArtifactContext', { required: false });
    }

    private async submitSigningRequest (): Promise<string> {

        core.info('Submitting the signing request to SignPath CI connector...');

        // prepare the payload
        const submitRequestPayload = {
            ApiToken: this.signPathToken,
            artifactName: this.artifactName,
            signPathOrganizationId: this.organizationId,
            signPathProjectSlug: this.projectSlug,
            signPathSigningPolicySlug: this.signingPolicySlug,
            signPathArtifactConfigurationSlug: this.artifactConfigurationSlug,

            gitHubRepository: process.env.GITHUB_REPOSITORY,
            gitHubApiUrl: process.env.GITHUB_API_URL,
            gitHubWorkflowRunId: this.workflowRunId,
            gitHubDownloadArtifactWorkflowName: this.downloadArtifactWorkflowName,
            gitHubArtifactContext: this.artifactContext
        };

        // call the signPath API to submit the signing request
        const response = (await axios
            .post<SubmitSigningRequestResult>(this.urlBuilder.buildSubmitSigningRequestUrl(),
            submitRequestPayload,
            { responseType: "json" })
            .catch((e: AxiosError) => {
                core.error(`SignPath API call error: ${e.message}.`);
                if(e.response?.data && typeof(e.response.data) === "string") {
                     throw new Error(e.response.data);
                }
                throw new Error(e.message);
            }))
            .data;

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

        if (response.error) {
            // got error from the connector
            throw new Error(response.error);
        }

        core.info(`SignPath signing request has been successfully submitted.`);
        core.info(`You can view the signing request here: ${response.signingRequestUrl}`);

        return response.signingRequestId;
    }
}
