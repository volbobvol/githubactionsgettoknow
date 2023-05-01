export class SignPathUrlBuilder {

    constructor(
        private signPathBaseUrl: string,
        private signPathGithHbConnectorBaseUrl: string) {

        this.signPathBaseUrl = this.trimSlash(this.signPathBaseUrl);
        this.signPathGithHbConnectorBaseUrl = this.trimSlash(this.signPathGithHbConnectorBaseUrl);
    }

    buildSubmitSigningRequestUrl(): string {
        return this.signPathGithHbConnectorBaseUrl  + '/api/sign';
    }

    buildGetSigningRequestUrl(organizationId: string, signingRequestId: string): string {
        return this.signPathBaseUrl  + `/API/v1/${encodeURIComponent(organizationId)}/SigningRequests/${encodeURIComponent(signingRequestId)}`;
    }

    private trimSlash(text: string): string {
        if(text && text[text.length - 1] === '/') {
            return text.substring(0, text.length - 1);
        }
        return text;
    }

}