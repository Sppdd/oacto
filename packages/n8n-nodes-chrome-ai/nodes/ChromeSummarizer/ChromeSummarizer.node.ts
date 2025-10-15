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
    description: 'Summarize text with Chrome built-in Summarizer API - Local & Private',
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
        const type = this.getNodeParameter('type', i) as 'tl;dr' | 'key-points' | 'teaser' | 'headline';
        const format = this.getNodeParameter('format', i) as 'plain-text' | 'markdown';
        const length = this.getNodeParameter('length', i) as 'short' | 'medium' | 'long';

        const result = await client.summarizer({
          text,
          type,
          format,
          length,
        });

        returnData.push({
          json: {
            ...items[i].json,
            summary: result,
            _meta: {
              originalLength: text.length,
              summaryLength: result.length,
              type,
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

