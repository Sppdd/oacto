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
    description: 'Generate text with Chrome built-in Writer API - Local & Private',
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
        'Chrome AI bridge is not responding. Ensure bridge server and extension are running.'
      );
    }

    for (let i = 0; i < items.length; i++) {
      try {
        const prompt = this.getNodeParameter('prompt', i) as string;
        const tone = this.getNodeParameter('tone', i) as 'formal' | 'neutral' | 'casual';
        const format = this.getNodeParameter('format', i) as 'plain-text' | 'markdown';
        const length = this.getNodeParameter('length', i) as 'short' | 'medium' | 'long';

        const result = await client.writer({
          prompt,
          tone,
          format,
          length,
        });

        returnData.push({
          json: {
            ...items[i].json,
            generatedText: result,
            _meta: {
              prompt,
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

