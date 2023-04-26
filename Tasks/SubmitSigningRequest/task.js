"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const axios_1 = __importDefault(require("axios"));
const core = __importStar(require("@actions/core"));
class Task {
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                core.info('Execution started...');
                const connectorUrl = core.getInput('SignPathconnectorUrl', { required: true });
                const artifactName = core.getInput('ArtifactName', { required: true });
                core.info('Submitting the signing request to the CI connector...');
                const submitRequestPayload = {
                    ciUserToken: core.getInput('CIUserToken', { required: true }),
                    artifactName,
                    signPathOrganizationId: core.getInput('OrganizationId', { required: true }),
                    signPathProjectSlug: core.getInput('ProjectSlug', { required: true }),
                    signPathSigningPolicySlug: core.getInput('SigningPolicySlug', { required: true }),
                    signPathArtifactConfigurationSlug: core.getInput('ArtifactConfigurationSlug', { required: true }),
                    systemAccessToken: core.getInput('secrets.GITHUB_TOKEN', { required: true })
                };
                core.debug(`Payload: ${btoa(JSON.stringify(submitRequestPayload))}`);
                const response = (yield axios_1.default
                    .post(connectorUrl + 'api/sign', submitRequestPayload, { responseType: "json" })
                    .catch((e) => {
                    var _a;
                    if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.data) && typeof (e.response.data) === "string") {
                        throw new Error(e.response.data);
                    }
                    throw new Error(e.message);
                }))
                    .data;
                core.debug(JSON.stringify(response));
                if (response.error) {
                    throw new Error(response.error);
                }
                if (response.validationResult && response.validationResult.errors.length > 0) {
                    core.startGroup('CI system setup validation errors');
                    core.error(`[error]Build artifact \"${artifactName}\" cannot be signed because of continuous integration system setup validation errors:`);
                    response.validationResult.errors.forEach(validationError => {
                        core.error(`[error]${validationError.error}`);
                        if (validationError.howToFix) {
                            core.info(validationError.howToFix);
                        }
                    });
                    core.endGroup();
                    throw new Error("CI system vlidation failed.");
                }
                if (response.signingRequestId) {
                    core.info('SignPath signing request has been successfully submitted.');
                    core.info(`You can view the signing request here: ${response.signingRequestUrl}`);
                    core.setOutput('signingRequestId', response.signingRequestId);
                }
                else {
                    // either an Error message, Signing Request Id, or validation message should be present in the response
                    throw new Error('Invalid submit signing request result.');
                }
            }
            catch (err) {
                core.setFailed(err.message);
            }
        });
    }
}
exports.Task = Task;
