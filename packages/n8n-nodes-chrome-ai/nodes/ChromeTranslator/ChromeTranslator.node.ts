import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import { ChromeAiClient } from '../../utils/ChromeAiClient';

export class ChromeTranslator implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Chrome Translator',
    name: 'chromeTranslator',
    icon: 'file:chrome-translator.svg',
    group: ['transform'],
    version: 1,
    description: 'Translate text with Chrome built-in Translator API - Local & Private',
    defaults: {
      name: 'Chrome Translator',
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
        displayName: 'Text to Translate',
        name: 'text',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        required: true,
        default: '',
        description: 'Text to translate. Can reference {{$json.field}}',
        placeholder: 'Hello world or {{$json.content}}',
      },
      {
        displayName: 'Source Language',
        name: 'sourceLanguage',
        type: 'string',
        default: 'en',
        description: 'Source language code (e.g., en, es, fr). Leave empty for auto-detect.',
        placeholder: 'en',
      },
      {
        displayName: 'Target Language',
        name: 'targetLanguage',
        type: 'string',
        required: true,
        default: '',
        description: 'Target language code (e.g., es, fr, de, ja, zh)',
        placeholder: 'es',
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
        const sourceLanguage = this.getNodeParameter('sourceLanguage', i, '') as string;
        const targetLanguage = this.getNodeParameter('targetLanguage', i) as string;

        const result = await client.translator({
          text,
          sourceLanguage: sourceLanguage || undefined,
          targetLanguage,
        });

        returnData.push({
          json: {
            ...items[i].json,
            translatedText: result,
            _meta: {
              sourceLanguage: sourceLanguage || 'auto-detect',
              targetLanguage,
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

