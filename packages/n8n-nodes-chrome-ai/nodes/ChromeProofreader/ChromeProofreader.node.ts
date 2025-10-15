import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import { ChromeAiClient } from '../../utils/ChromeAiClient';

export class ChromeProofreader implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Chrome Proofreader',
    name: 'chromeProofreader',
    icon: 'file:chrome-proofreader.svg',
    group: ['transform'],
    version: 1,
    description: 'Proofread text with Chrome built-in Proofreader API - Local & Private',
    defaults: {
      name: 'Chrome Proofreader',
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
        displayName: 'Text to Proofread',
        name: 'text',
        type: 'string',
        typeOptions: {
          rows: 6,
        },
        required: true,
        default: '',
        description: 'Text to check for grammar, spelling, and clarity. Can reference {{$json.field}}',
        placeholder: 'Text to proofread or {{$json.content}}',
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

        const result = await client.proofreader({ text });

        returnData.push({
          json: {
            ...items[i].json,
            proofreadText: result,
            _meta: {
              originalText: text,
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

