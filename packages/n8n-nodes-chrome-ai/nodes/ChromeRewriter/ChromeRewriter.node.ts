import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import { ChromeAiClient } from '../../utils/ChromeAiClient';

export class ChromeRewriter implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Chrome Rewriter',
    name: 'chromeRewriter',
    icon: 'file:chrome-rewriter.svg',
    group: ['transform'],
    version: 1,
    description: 'Rewrite text with Chrome built-in Rewriter API - Local & Private. Falls back to Chrome Prompt AI if Rewriter API is unavailable. Fully compatible with n8n automation workflows.',
    defaults: {
      name: 'Chrome Rewriter',
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
        displayName: 'Text to Rewrite',
        name: 'text',
        type: 'string',
        typeOptions: {
          rows: 6,
        },
        required: true,
        default: '',
        description: 'Text to rewrite/rephrase. Can reference {{$json.field}}',
        placeholder: 'Original text or {{$json.content}}',
      },
      {
        displayName: 'Tone',
        name: 'tone',
        type: 'options',
        options: [
          { name: 'More Formal', value: 'more-formal' },
          { name: 'More Casual', value: 'more-casual' },
          { name: 'Formal', value: 'formal' },
          { name: 'Neutral', value: 'neutral' },
          { name: 'Casual', value: 'casual' },
        ],
        default: 'neutral',
        description: 'Desired tone for rewritten text',
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
          { name: 'Shorter', value: 'shorter' },
          { name: 'Same', value: 'same' },
          { name: 'Longer', value: 'longer' },
        ],
        default: 'same',
        description: 'Length relative to original',
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
        const tone = this.getNodeParameter('tone', i) as string;
        const format = this.getNodeParameter('format', i) as 'plain-text' | 'markdown';
        const length = this.getNodeParameter('length', i) as 'shorter' | 'same' | 'longer';
        const sessionOptions = this.getNodeParameter('sessionOptions', i, {}) as {
          sessionId?: string;
          forceNewSession?: boolean;
        };

        const response = await client.rewriter({
          text,
          tone: tone as any,
          format,
          length,
          sessionId: sessionOptions.sessionId,
          forceNewSession: sessionOptions.forceNewSession,
        });

        returnData.push({
          json: {
            ...items[i].json,
            rewrittenText: response.result,
            sessionId: response.sessionId,
            fallbackUsed: response.fallbackUsed || false,
            originalApi: response.originalApi || null,
            _meta: {
              originalText: text,
              tone,
              format,
              length,
              timestamp: new Date().toISOString(),
              sessionId: response.sessionId,
              fallbackUsed: response.fallbackUsed || false,
              originalApi: response.originalApi || 'Rewriter',
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

