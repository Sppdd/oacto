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
    description: 'Detect language with Chrome built-in Language Detector API - Local & Private',
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

        const detectedLanguage = await client.languageDetector({ text });

        returnData.push({
          json: {
            ...items[i].json,
            language: detectedLanguage,
            _meta: {
              text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
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

