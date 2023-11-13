export class SignPathUrlBuilder {

    public signPathBaseUrl: string = 'https://signpath.io';

    constructor(
        private signPathGithHbConnectorBaseUrl: string) {
        this.signPathGithHbConnectorBaseUrl = this.trimSlash(this.signPathGithHbConnectorBaseUrl);
    }

    buildSubmitSigningRequestUrl(): string {
        return this.signPathGithHbConnectorBaseUrl  + '/api/sign';
    }

    buildGetSigningRequestUrl(organizationId: string, signingRequestId: string): string {
        if (!this.signPathBaseUrl) {
            throw new Error('SignPath Base Url is not set');
        }

        return this.signPathBaseUrl  + `/API/v1/${encodeURIComponent(organizationId)}/SigningRequests/${encodeURIComponent(signingRequestId)}`;
    }

    private trimSlash(text: string): string {
        if(text && text[text.length - 1] === '/') {
            return text.substring(0, text.length - 1);
        }
        return text;
    }

}