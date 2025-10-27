import {
  IAuthenticateGeneric,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ChromeAiApi implements ICredentialType {
  name = 'chromeAiApi';
  displayName = 'Chrome AI API';
  documentationUrl = 'https://github.com/yourusername/n8n-nodes-chrome-ai';
  properties: INodeProperties[] = [
    {
      displayName: 'Bridge URL',
      name: 'bridgeUrl',
      type: 'string',
      default: 'http://localhost:3333',
      required: true,
      description: 'URL of the Chrome AI bridge server (runs locally)',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Optional API key for bridge authentication (set in extension settings)',
    },
    {
      displayName: 'Origin Trial Tokens',
      name: 'tokens',
      type: 'collection',
      placeholder: 'Add Token',
      default: {},
      options: [
        {
          displayName: 'Prompt AI Token',
          name: 'promptAiToken',
          type: 'string',
          typeOptions: {
            password: true,
          },
          default: '',
          description: 'Origin trial token for Chrome Prompt AI (AIPromptAPIMultimodalInput)',
          placeholder: 'AoXwZGsUZlGEyuueX5nR6tujynrCfWhNWQnZcHTy3AZkXtCMULt/UJs6+/1Bp5jVw7Ue96Tcyf1IO8IRUMimAgcAAABeeyJvcmlnaW4iOiJodHRwczovL2Nocm9tZS5kZXY6NDQzIiwiZmVhdHVyZSI6IkFJUHJvbXB0QVBJTXVsdGltb2RhbElucHV0IiwiZXhwaXJ5IjoxNzc0MzEwNDAwfQ==',
        },
        {
          displayName: 'Writer API Token',
          name: 'writerToken',
          type: 'string',
          typeOptions: {
            password: true,
          },
          default: '',
          description: 'Origin trial token for Chrome Writer API',
          placeholder: 'Your Writer API token here',
        },
        {
          displayName: 'Summarizer API Token',
          name: 'summarizerToken',
          type: 'string',
          typeOptions: {
            password: true,
          },
          default: '',
          description: 'Origin trial token for Chrome Summarizer API (Note: May fallback to Prompt AI)',
          placeholder: 'Your Summarizer API token here',
        },
        {
          displayName: 'Translator API Token',
          name: 'translatorToken',
          type: 'string',
          typeOptions: {
            password: true,
          },
          default: '',
          description: 'Origin trial token for Chrome Translator API (Note: May fallback to Prompt AI)',
          placeholder: 'Your Translator API token here',
        },
        {
          displayName: 'Rewriter API Token',
          name: 'rewriterToken',
          type: 'string',
          typeOptions: {
            password: true,
          },
          default: '',
          description: 'Origin trial token for Chrome Rewriter API (Note: May fallback to Prompt AI)',
          placeholder: 'Your Rewriter API token here',
        },
        {
          displayName: 'Proofreader API Token',
          name: 'proofreaderToken',
          type: 'string',
          typeOptions: {
            password: true,
          },
          default: '',
          description: 'Origin trial token for Chrome Proofreader API (Note: May fallback to Prompt AI)',
          placeholder: 'Your Proofreader API token here',
        },
        {
          displayName: 'Language Detector API Token',
          name: 'languageDetectorToken',
          type: 'string',
          typeOptions: {
            password: true,
          },
          default: '',
          description: 'Origin trial token for Chrome Language Detector API (Note: May fallback to Prompt AI)',
          placeholder: 'Your Language Detector API token here',
        },
      ],
      description: 'Origin trial tokens for each Chrome AI API. Get tokens from https://developer.chrome.com/origintrials/',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}',
      },
    },
  };
}

