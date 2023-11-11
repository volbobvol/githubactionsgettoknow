# Submit-Signing-Request

This Submit Signing Request allowing you to sign the build artifact using SignPath signing services.

## Usage

See [action.yml](action.yml)

### Sign published artifact and download the signed artifact back to the build agent file system

```yaml
steps:
- uses: signpath/gitgub-actions-integration/tasks/submit-signing-request@main
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
- uses: signpath/gitgub-actions-integration/tasks/submit-signing-request@main
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

### SignPath API token
Please make sure the API token has the following permissions:
- Reader for the specified SignPath project
- Submitter for the specified SignPath policy

### Troubleshooting
- N/A

### Known issues
- N/A