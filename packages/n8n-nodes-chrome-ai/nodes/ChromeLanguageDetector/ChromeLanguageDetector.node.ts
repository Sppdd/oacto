import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import { ChromeAiClient } from '../../utils/ChromeAiClient';

export class ChromeLanguageDetector implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Chrome Language Detector',
    name: 'chromeLanguageDetector',
    icon: 'file:chrome-language-detector.svg',
    group: ['transform'],
    version: 1,
    description: 'Detect language with Chrome built-in Language Detector API - Local & Private. Falls back to Chrome Prompt AI if Language Detector API is unavailable. Fully compatible with n8n automation workflows.',
    defaults: {
      name: 'Chrome Language Detector',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'chromeAiApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Text to Analyze',
        name: 'text',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        required: true,
        default: '',
        description: 'Text to detect language from. Can reference {{$json.field}}',
        placeholder: 'Text in any language or {{$json.content}}',
      },
      {
        displayName: 'Session Management',
        name: 'sessionOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Session ID',
            name: 'sessionId',
            type: 'string',
            default: '',
            description: 'Existing session ID to continue conversation. Leave empty for new session.',
            placeholder: 'Leave empty for new session',
          },
          {
            displayName: 'Force New Session',
            name: 'forceNewSession',
            type: 'boolean',
            default: false,
            description: 'Force creation of a new session even if session ID is provided',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('chromeAiApi');
    const client = new ChromeAiClient({
      bridgeUrl: credentials.bridgeUrl as string,
      apiKey: credentials.apiKey as string,
      tokens: credentials.tokens as any,
    });

    const isHealthy = await client.healthCheck();
    if (!isHealthy) {
      throw new NodeOperationError(
        this.getNode(),
        'Chrome AI bridge is not responding.'
      );
    }

    for (let i = 0; i < items.length; i++) {
      try {
        const text = this.getNodeParameter('text', i) as string;
        const sessionOptions = this.getNodeParameter('sessionOptions', i, {}) as {
          sessionId?: string;
          forceNewSession?: boolean;
        };

        const response = await client.languageDetector({
          text,
          sessionId: sessionOptions.sessionId,
          forceNewSession: sessionOptions.forceNewSession,
        });

        returnData.push({
          json: {
            ...items[i].json,
            language: response.result,
            sessionId: response.sessionId,
            fallbackUsed: response.fallbackUsed || false,
            originalApi: response.originalApi || null,
            _meta: {
              text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
              timestamp: new Date().toISOString(),
              sessionId: response.sessionId,
              fallbackUsed: response.fallbackUsed || false,
              originalApi: response.originalApi || 'LanguageDetector',
            },
          },
          pairedItem: i,
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              ...items[i].json,
              error: error instanceof Error ? error.message : String(error),
            },
            pairedItem: i,
          });
          continue;
        }
        throw new NodeOperationError(this.getNode(), error instanceof Error ? error.message : String(error), { itemIndex: i });
      }
    }

    return [returnData];
  }
}

