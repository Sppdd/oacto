import axios, { AxiosInstance } from 'axios';

export interface ChromeAiClientConfig {
  bridgeUrl: string;
  apiKey?: string;
  timeout?: number;
  tokens?: {
    promptAiToken?: string;
    writerToken?: string;
    summarizerToken?: string;
    translatorToken?: string;
    rewriterToken?: string;
    proofreaderToken?: string;
    languageDetectorToken?: string;
  };
}

export interface BaseAiRequest {
  sessionId?: string;
  forceNewSession?: boolean;
}

export interface PromptAiRequest extends BaseAiRequest {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  outputLanguage?: string;
}

export interface WriterRequest extends BaseAiRequest {
  prompt: string;
  tone?: 'formal' | 'neutral' | 'casual';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
}

export interface SummarizerRequest extends BaseAiRequest {
  text: string;
  type?: 'tl;dr' | 'key-points' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
}

export interface TranslatorRequest extends BaseAiRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
}

export interface RewriterRequest extends BaseAiRequest {
  text: string;
  tone?: 'formal' | 'neutral' | 'casual' | 'more-formal' | 'more-casual';
  format?: 'plain-text' | 'markdown';
  length?: 'shorter' | 'same' | 'longer';
}

export interface ProofreaderRequest extends BaseAiRequest {
  text: string;
}

export interface LanguageDetectorRequest extends BaseAiRequest {
  text: string;
}

export interface ApiResponse<T> {
  success: boolean;
  result?: T;
  sessionId?: string;
  error?: string;
}

export class ChromeAiClient {
  private client: AxiosInstance;
  private tokens: ChromeAiClientConfig['tokens'];

  constructor(config: ChromeAiClientConfig) {
    this.tokens = config.tokens || {};
    this.client = axios.create({
      baseURL: config.bridgeUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-API-Key': config.apiKey }),
        ...(this.tokens.promptAiToken && { 'X-Prompt-AI-Token': this.tokens.promptAiToken }),
        ...(this.tokens.writerToken && { 'X-Writer-Token': this.tokens.writerToken }),
        ...(this.tokens.summarizerToken && { 'X-Summarizer-Token': this.tokens.summarizerToken }),
        ...(this.tokens.translatorToken && { 'X-Translator-Token': this.tokens.translatorToken }),
        ...(this.tokens.rewriterToken && { 'X-Rewriter-Token': this.tokens.rewriterToken }),
        ...(this.tokens.proofreaderToken && { 'X-Proofreader-Token': this.tokens.proofreaderToken }),
        ...(this.tokens.languageDetectorToken && { 'X-Language-Detector-Token': this.tokens.languageDetectorToken }),
      },
    });
  }

  async promptAi(request: PromptAiRequest): Promise<{result: string, sessionId?: string}> {
    const response = await this.client.post<ApiResponse<string>>('/api/prompt-ai', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Prompt AI request failed');
    }
    return {
      result: response.data.result!,
      sessionId: response.data.sessionId
    };
  }

  async writer(request: WriterRequest): Promise<{result: string, sessionId?: string, fallbackUsed?: boolean, originalApi?: string}> {
    const response = await this.client.post<ApiResponse<string>>('/api/writer', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Writer request failed');
    }
    return {
      result: response.data.result!,
      sessionId: response.data.sessionId,
      fallbackUsed: response.data.fallbackUsed,
      originalApi: response.data.originalApi
    };
  }

  async summarizer(request: SummarizerRequest): Promise<{result: string, sessionId?: string, fallbackUsed?: boolean, originalApi?: string}> {
    const response = await this.client.post<ApiResponse<string>>('/api/summarizer', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Summarizer request failed');
    }
    return {
      result: response.data.result!,
      sessionId: response.data.sessionId,
      fallbackUsed: response.data.fallbackUsed,
      originalApi: response.data.originalApi
    };
  }

  async translator(request: TranslatorRequest): Promise<{result: string, sessionId?: string, fallbackUsed?: boolean, originalApi?: string}> {
    const response = await this.client.post<ApiResponse<string>>('/api/translator', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Translator request failed');
    }
    return {
      result: response.data.result!,
      sessionId: response.data.sessionId,
      fallbackUsed: response.data.fallbackUsed,
      originalApi: response.data.originalApi
    };
  }

  async rewriter(request: RewriterRequest): Promise<{result: string, sessionId?: string, fallbackUsed?: boolean, originalApi?: string}> {
    const response = await this.client.post<ApiResponse<string>>('/api/rewriter', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Rewriter request failed');
    }
    return {
      result: response.data.result!,
      sessionId: response.data.sessionId,
      fallbackUsed: response.data.fallbackUsed,
      originalApi: response.data.originalApi
    };
  }

  async proofreader(request: ProofreaderRequest): Promise<{result: string, sessionId?: string, fallbackUsed?: boolean, originalApi?: string}> {
    const response = await this.client.post<ApiResponse<string>>('/api/proofreader', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Proofreader request failed');
    }
    return {
      result: response.data.result!,
      sessionId: response.data.sessionId,
      fallbackUsed: response.data.fallbackUsed,
      originalApi: response.data.originalApi
    };
  }

  async languageDetector(request: LanguageDetectorRequest): Promise<{result: string, sessionId?: string, fallbackUsed?: boolean, originalApi?: string}> {
    const response = await this.client.post<ApiResponse<string>>('/api/language-detector', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Language detector request failed');
    }
    return {
      result: response.data.result!,
      sessionId: response.data.sessionId,
      fallbackUsed: response.data.fallbackUsed,
      originalApi: response.data.originalApi
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health');
      return response.data.status === 'ok';
    } catch {
      return false;
    }
  }

  async updateTokens(tokens: ChromeAiClientConfig['tokens']): Promise<void> {
    this.tokens = tokens || {};

    // Update headers
    this.client.defaults.headers.common['X-Prompt-AI-Token'] = this.tokens.promptAiToken || '';
    this.client.defaults.headers.common['X-Writer-Token'] = this.tokens.writerToken || '';
    this.client.defaults.headers.common['X-Summarizer-Token'] = this.tokens.summarizerToken || '';
    this.client.defaults.headers.common['X-Translator-Token'] = this.tokens.translatorToken || '';
    this.client.defaults.headers.common['X-Rewriter-Token'] = this.tokens.rewriterToken || '';
    this.client.defaults.headers.common['X-Proofreader-Token'] = this.tokens.proofreaderToken || '';
    this.client.defaults.headers.common['X-Language-Detector-Token'] = this.tokens.languageDetectorToken || '';
  }
}

