import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import { ChromeAiClient } from '../../utils/ChromeAiClient';

export class ChromePromptAi implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Chrome Prompt AI',
    name: 'chromePromptAi',
    icon: 'file:chrome-prompt-ai.svg',
    group: ['transform'],
    version: 1,
    description: 'Use Chrome built-in Prompt API (Gemini Nano) - Runs locally on your machine',
    defaults: {
      name: 'Chrome Prompt AI',
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
        displayName: 'System Prompt',
        name: 'systemPrompt',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'System instructions that guide the AI behavior (e.g., "You are a helpful assistant that...")',
        placeholder: 'You are a professional content writer...',
      },
      {
        displayName: 'User Prompt',
        name: 'userPrompt',
        type: 'string',
        typeOptions: {
          rows: 6,
        },
        required: true,
        default: '',
        description: 'The prompt to send to the AI. Use {{$json.field}} to reference input data.',
        placeholder: 'Write a professional email about {{$json.topic}}',
      },
      {
        displayName: 'Temperature',
        name: 'temperature',
        type: 'number',
        default: 0.8,
        typeOptions: {
          minValue: 0,
          maxValue: 2,
          numberStepSize: 0.1,
        },
        description: 'Controls randomness/creativity. Lower = more focused, Higher = more creative.',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Continue On Fail',
            name: 'continueOnFail',
            type: 'boolean',
            default: false,
            description: 'Whether to continue processing other items if this one fails',
          },
          {
            displayName: 'Batch Size',
            name: 'batchSize',
            type: 'number',
            default: 1,
            description: 'Number of items to process at once (parallel requests)',
            typeOptions: {
              minValue: 1,
              maxValue: 10,
            },
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await this.getCredentials('chromeAiApi');
    const client = new ChromeAiClient({
      bridgeUrl: credentials.bridgeUrl as string,
      apiKey: credentials.apiKey as string,
    });

    // Check bridge health before processing
    const isHealthy = await client.healthCheck();
    if (!isHealthy) {
      throw new NodeOperationError(
        this.getNode(),
        'Chrome AI bridge is not responding. Please ensure:\n' +
        '1. Chrome extension is installed and running\n' +
        '2. Bridge server is running (npm start in bridge-server/)\n' +
        '3. Bridge URL is correct (default: http://localhost:3333)'
      );
    }

    // Process each input item
    for (let i = 0; i < items.length; i++) {
      try {
        const systemPrompt = this.getNodeParameter('systemPrompt', i, '') as string;
        const userPrompt = this.getNodeParameter('userPrompt', i) as string;
        const temperature = this.getNodeParameter('temperature', i) as number;
        const options = this.getNodeParameter('options', i, {}) as {
          continueOnFail?: boolean;
          batchSize?: number;
        };

        // Call Chrome AI via bridge
        const result = await client.promptAi({
          systemPrompt: systemPrompt || undefined,
          userPrompt,
          temperature,
        });

        // Return result with original input data
        returnData.push({
          json: {
            ...items[i].json,
            aiResult: result,
            _meta: {
              prompt: userPrompt,
              systemPrompt: systemPrompt || null,
              temperature,
              timestamp: new Date().toISOString(),
              model: 'gemini-nano',
            },
          },
          pairedItem: i,
        });
      } catch (error) {
        const continueOnFail = this.getNodeParameter('options.continueOnFail', i, false) as boolean;
        
        if (continueOnFail || this.continueOnFail()) {
          returnData.push({
            json: {
              ...items[i].json,
              error: error instanceof Error ? error.message : String(error),
              _meta: {
                failed: true,
                timestamp: new Date().toISOString(),
              },
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

