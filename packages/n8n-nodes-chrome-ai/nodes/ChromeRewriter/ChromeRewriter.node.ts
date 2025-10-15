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
    description: 'Rewrite text with Chrome built-in Rewriter API - Local & Private',
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
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('chromeAiApi');
    const client = new ChromeAiClient({
      bridgeUrl: credentials.bridgeUrl as string,
      apiKey: credentials.apiKey as string,
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

        const result = await client.rewriter({
          text,
          tone: tone as any,
          format,
          length,
        });

        returnData.push({
          json: {
            ...items[i].json,
            rewrittenText: result,
            _meta: {
              originalText: text,
              tone,
              format,
              length,
              timestamp: new Date().toISOString(),
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

