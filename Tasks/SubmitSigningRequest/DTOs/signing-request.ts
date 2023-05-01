export interface SigningRequestDto
  {
    signingRequestStatus: SigningRequestStatus;
    signingRequestWorkflowStatus: SigningRequestWorkflowStatus;
    SignedArtifactLink: string;
    ProjectSlug: string;
    isFinalStatus: boolean;
  }

  export enum SigningRequestWorkflowStatus
  {
    Submitted,
    RetrievingArtifact,
    WaitingForApproval,
    QueuedForMalwareScanning,
    ScanningForMalware,
    QueuedForProcessing,
    Processing,
    Completed,
    ProcessingFailed,
    MalwareScanFailed,
    MalwareDetected,
    ArtifactRetrievalFailed,
    Denied,
    Canceled
  }

  export enum SigningRequestStatus
  {
    InProgress,
    WaitingForApproval,
    Completed,
    Failed,
    Denied,
    Canceled
  }