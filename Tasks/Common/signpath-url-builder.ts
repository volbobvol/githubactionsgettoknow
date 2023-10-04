export class SignPathUrlBuilder {

    constructor(
        private signPathGithHbConnectorBaseUrl: string) {
this.signPathGithHbConnectorBaseUrl = this.trimSlash(this.signPathGithHbConnectorBaseUrl);
    }

    buildSubmitSigningRequestUrl(): string {
        return this.signPathGithHbConnectorBaseUrl  + '/api/sign';
    }

    private trimSlash(text: string): string {
        if(text && text[text.length - 1] === '/') {
            return text.substring(0, text.length - 1);
        }
        return text;
    }
}