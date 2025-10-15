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

