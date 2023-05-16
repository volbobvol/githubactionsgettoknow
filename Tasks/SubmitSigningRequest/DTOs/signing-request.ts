export interface SigningRequestDto
  {
    status: string;
    workflowStatus: string;
    SignedArtifactLink: string;
    ProjectSlug: string;
    isFinalStatus: boolean;
  }
