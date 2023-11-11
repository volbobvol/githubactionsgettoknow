# Submit-Signing-Request

This Submit Signing Request action allowing you to sign the build artifact using SignPath signing services.

## Usage

See [action.yml](action.yml)

### Sign published artifact and download the signed artifact back to the build agent file system

```yaml
steps:
- id: optional_step_id
  uses: signpath/gitgub-actions-integration/tasks/submit-signing-request@main
      with:
        signPathConnectorUrl: '<SignPath GitHub Actions connector URL>'
        apiToken: '${{ secrets.SIGNPATH_API_TOKEN }}'
        organizationId: '<SignPath Organization Id>'
        projectSlug: '<SignPath Project Slug>'
        signingPolicySlug: '<SignPath Policy Slug>'
        artifactConfigurationSlug: '<SignPath Artifact Configuration Slug>'
        artifactName: '<Name of the artifact to sign>'
        gitHubToken: '${{ secrets.GITHUB_TOKEN }}'
        signedArtifactDestinationPath: '<Destination path for the signed artifact>'
```

### Sign published artifact and continue workflow execution

```yaml
steps:
- id: optional_step_id
  uses: signpath/gitgub-actions-integration/tasks/submit-signing-request@main
      with:
        signPathConnectorUrl: '<SignPath GitHub Actions connector URL>'
        apiToken: '${{ secrets.SIGNPATH_API_TOKEN }}'
        organizationId: '<SignPath Organization Id>'
        projectSlug: '<SignPath Project Slug>'
        signingPolicySlug: '<SignPath Policy Slug>'
        artifactConfigurationSlug: '<SignPath Artifact Configuration Slug>'
        artifactName: '<Name of the artifact to sign>'
        gitHubToken: '${{ secrets.GITHUB_TOKEN }}'
```

### Sign published artifact action output parameters
submit-signing-request supports the following output parameters:
- signingRequestId - The id of the newly created signing request
- signingRequestWebUrl - The url of the signing request in SignPath
- signPathApiUrl - The base API url of the SignPath API
- signingRequestDownloadUrl - The url of the signed artifact in SignPath

You can use the output parameters in the following way:
```yaml
    steps:
    - name: Print the signing request id
      run:  echo "Output [${{steps.submit_signing_request_step_id.outputs.signingRequestId }}]"
```

### SignPath API token
Please make sure the API token has the following permissions:
- Reader for the specified SignPath project
- Submitter for the specified SignPath policy

### Troubleshooting
- N/A

### Known issues
- N/A