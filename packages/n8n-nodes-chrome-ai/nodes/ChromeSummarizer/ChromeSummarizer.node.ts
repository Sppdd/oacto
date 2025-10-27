import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import { ChromeAiClient } from '../../utils/ChromeAiClient';

export class ChromeSummarizer implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Chrome Summarizer',
    name: 'chromeSummarizer',
    icon: 'file:chrome-summarizer.svg',
    group: ['transform'],
    version: 1,
    description: 'Summarize text with Chrome built-in Summarizer API - Local & Private. Falls back to Chrome Prompt AI if Summarizer API is unavailable. Fully compatible with n8n automation workflows.',
    defaults: {
      name: 'Chrome Summarizer',
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
        displayName: 'Text to Summarize',
        name: 'text',
        type: 'string',
        typeOptions: {
          rows: 6,
        },
        required: true,
        default: '',
        description: 'The text to summarize. Can reference {{$json.field}}',
        placeholder: 'Long article text here or use {{$json.content}}',
      },
      {
        displayName: 'Summary Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'TL;DR', value: 'tl;dr' },
          { name: 'Key Points', value: 'key-points' },
          { name: 'Teaser', value: 'teaser' },
          { name: 'Headline', value: 'headline' },
        ],
        default: 'tl;dr',
        description: 'Type of summary to generate',
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
        description: 'Summary length',
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
        const type = this.getNodeParameter('type', i) as 'tl;dr' | 'key-points' | 'teaser' | 'headline';
        const format = this.getNodeParameter('format', i) as 'plain-text' | 'markdown';
        const length = this.getNodeParameter('length', i) as 'short' | 'medium' | 'long';
        const sessionOptions = this.getNodeParameter('sessionOptions', i, {}) as {
          sessionId?: string;
          forceNewSession?: boolean;
        };

        const response = await client.summarizer({
          text,
          type,
          format,
          length,
          sessionId: sessionOptions.sessionId,
          forceNewSession: sessionOptions.forceNewSession,
        });

        returnData.push({
          json: {
            ...items[i].json,
            summary: response.result,
            sessionId: response.sessionId,
            fallbackUsed: response.fallbackUsed || false,
            originalApi: response.originalApi || null,
            _meta: {
              originalLength: text.length,
              summaryLength: response.result.length,
              type,
              format,
              length,
              timestamp: new Date().toISOString(),
              sessionId: response.sessionId,
              fallbackUsed: response.fallbackUsed || false,
              originalApi: response.originalApi || 'Summarizer',
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

