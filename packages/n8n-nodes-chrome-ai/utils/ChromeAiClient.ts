import axios, { AxiosInstance } from 'axios';

export interface ChromeAiClientConfig {
  bridgeUrl: string;
  apiKey?: string;
  timeout?: number;
}

export interface PromptAiRequest {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
}

export interface WriterRequest {
  prompt: string;
  tone?: 'formal' | 'neutral' | 'casual';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
}

export interface SummarizerRequest {
  text: string;
  type?: 'tl;dr' | 'key-points' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
}

export interface TranslatorRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
}

export interface RewriterRequest {
  text: string;
  tone?: 'formal' | 'neutral' | 'casual' | 'more-formal' | 'more-casual';
  format?: 'plain-text' | 'markdown';
  length?: 'shorter' | 'same' | 'longer';
}

export interface ProofreaderRequest {
  text: string;
}

export interface LanguageDetectorRequest {
  text: string;
}

export interface ApiResponse<T> {
  success: boolean;
  result?: T;
  error?: string;
}

export class ChromeAiClient {
  private client: AxiosInstance;

  constructor(config: ChromeAiClientConfig) {
    this.client = axios.create({
      baseURL: config.bridgeUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-API-Key': config.apiKey }),
      },
    });
  }

  async promptAi(request: PromptAiRequest): Promise<string> {
    const response = await this.client.post<ApiResponse<string>>('/api/prompt-ai', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Prompt AI request failed');
    }
    return response.data.result!;
  }

  async writer(request: WriterRequest): Promise<string> {
    const response = await this.client.post<ApiResponse<string>>('/api/writer', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Writer request failed');
    }
    return response.data.result!;
  }

  async summarizer(request: SummarizerRequest): Promise<string> {
    const response = await this.client.post<ApiResponse<string>>('/api/summarizer', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Summarizer request failed');
    }
    return response.data.result!;
  }

  async translator(request: TranslatorRequest): Promise<string> {
    const response = await this.client.post<ApiResponse<string>>('/api/translator', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Translator request failed');
    }
    return response.data.result!;
  }

  async rewriter(request: RewriterRequest): Promise<string> {
    const response = await this.client.post<ApiResponse<string>>('/api/rewriter', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Rewriter request failed');
    }
    return response.data.result!;
  }

  async proofreader(request: ProofreaderRequest): Promise<string> {
    const response = await this.client.post<ApiResponse<string>>('/api/proofreader', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Proofreader request failed');
    }
    return response.data.result!;
  }

  async languageDetector(request: LanguageDetectorRequest): Promise<string> {
    const response = await this.client.post<ApiResponse<string>>('/api/language-detector', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Language detector request failed');
    }
    return response.data.result!;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health');
      return response.data.status === 'ok';
    } catch {
      return false;
    }
  }
}

