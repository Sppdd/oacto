import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import { ChromeAiClient } from '../../utils/ChromeAiClient';

export class ChromeWriter implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Chrome Writer',
    name: 'chromeWriter',
    icon: 'file:chrome-writer.svg',
    group: ['transform'],
    version: 1,
    description: 'Generate text with Chrome built-in Writer API - Local & Private. Falls back to Chrome Prompt AI if Writer API is unavailable or requires user interaction. Fully compatible with n8n automation workflows.',
    defaults: {
      name: 'Chrome Writer',
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
        displayName: 'Prompt',
        name: 'prompt',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        required: true,
        default: '',
        description: 'What you want the AI to write about',
        placeholder: 'Write a professional email about...',
      },
      {
        displayName: 'Tone',
        name: 'tone',
        type: 'options',
        options: [
          { name: 'Formal', value: 'formal' },
          { name: 'Neutral', value: 'neutral' },
          { name: 'Casual', value: 'casual' },
        ],
        default: 'neutral',
        description: 'Writing tone/style',
      },
      {
        displayName: 'Format',
        name: 'format',
        type: 'options',
        options: [
          { name: 'Plain Text', value: 'plain-text' },
          { name: 'Markdown', value: 'markdown' },
        ],
        default: 'plain-text',
        description: 'Output format',
      },
      {
        displayName: 'Length',
        name: 'length',
        type: 'options',
        options: [
          { name: 'Short', value: 'short' },
          { name: 'Medium', value: 'medium' },
          { name: 'Long', value: 'long' },
        ],
        default: 'medium',
        description: 'Desired output length',
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
        'Chrome AI bridge is not responding. Ensure bridge server and extension are running.'
      );
    }

    for (let i = 0; i < items.length; i++) {
      try {
        const prompt = this.getNodeParameter('prompt', i) as string;
        const tone = this.getNodeParameter('tone', i) as 'formal' | 'neutral' | 'casual';
        const format = this.getNodeParameter('format', i) as 'plain-text' | 'markdown';
        const length = this.getNodeParameter('length', i) as 'short' | 'medium' | 'long';
        const sessionOptions = this.getNodeParameter('sessionOptions', i, {}) as {
          sessionId?: string;
          forceNewSession?: boolean;
        };

        const response = await client.writer({
          prompt,
          tone,
          format,
          length,
          sessionId: sessionOptions.sessionId,
          forceNewSession: sessionOptions.forceNewSession,
        });

        returnData.push({
          json: {
            ...items[i].json,
            generatedText: response.result,
            sessionId: response.sessionId,
            fallbackUsed: response.fallbackUsed || false,
            originalApi: response.originalApi || null,
            _meta: {
              prompt,
              tone,
              format,
              length,
              timestamp: new Date().toISOString(),
              sessionId: response.sessionId,
              fallbackUsed: response.fallbackUsed || false,
              originalApi: response.originalApi || 'Writer',
            },
          },
          pairedItem: i,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Provide helpful error messages for common issues
        let userFriendlyMessage = errorMessage;

        if (errorMessage.includes('user gesture') || errorMessage.includes('Requires a user gesture')) {
          userFriendlyMessage = 'Chrome Writer API requires user interaction. This API cannot be used directly in n8n workflows. Please use the Chrome Prompt AI node instead, or use the webapp interface at http://localhost:3333 for Writer API functionality.';
        } else if (errorMessage.includes('not available') || errorMessage.includes('Writer API is not available')) {
          userFriendlyMessage = 'Chrome Writer API is not available. Please ensure: 1) You have enabled the Writer API in chrome://flags, 2) You have a valid origin trial token, 3) The webapp is open at http://localhost:3333, 4) The AI model is downloaded.';
        } else if (errorMessage.includes('downloading') || errorMessage.includes('downloadable')) {
          userFriendlyMessage = 'Chrome Writer API model is still downloading. Please wait for the download to complete (check chrome://components/) and try again.';
        }

        if (this.continueOnFail()) {
          returnData.push({
            json: {
              ...items[i].json,
              error: userFriendlyMessage,
              suggestion: 'Try using the Chrome Prompt AI node instead, which has the same functionality but works in n8n workflows.',
            },
            pairedItem: i,
          });
          continue;
        }
        throw new NodeOperationError(this.getNode(), userFriendlyMessage, { itemIndex: i });
      }
    }

    return [returnData];
  }
}

