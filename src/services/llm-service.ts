/**
 * @file LLM Service using Google Generative AI (Gemini 2.0 Flash)
 * @description Service for making LLM calls to analyze design patterns and provide structured JSON responses
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from '~/utils/logger.js';

export interface LLMConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class LLMService {
  private genAI: GoogleGenerativeAI;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: LLMConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'gemini-2.0-flash-exp';
    this.maxTokens = config.maxTokens || 1000;
    this.temperature = config.temperature || 0.1;
  }

  /**
   * Calls the LLM with a prompt and expects a JSON response
   * @param prompt The prompt to send to the LLM
   * @param retries Number of retry attempts (default: 3)
   * @returns Promise with parsed JSON response or error
   */
  async callLLM<T = any>(prompt: string, retries = 3): Promise<LLMResponse<T>> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        Logger.log(`LLM call attempt ${attempt}/${retries} with model: ${this.model}`);
        
        const model = this.genAI.getGenerativeModel({
          model: this.model,
          generationConfig: {
            maxOutputTokens: this.maxTokens,
            temperature: this.temperature,
            responseMimeType: "application/json",
          },
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (!text) {
          throw new Error('Empty response from LLM');
        }

        Logger.log('LLM response received, parsing JSON...');

        // Parse JSON response
        try {
          const jsonData = JSON.parse(text) as T;
          return {
            success: true,
            data: jsonData
          };
        } catch (parseError) {
          throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        Logger.log(`LLM call failed (attempt ${attempt}/${retries}): ${errorMessage}`);

        if (attempt === retries) {
          return {
            success: false,
            error: `LLM service failed after ${retries} attempts: ${errorMessage}`
          };
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return {
      success: false,
      error: 'Unexpected error in LLM service'
    };
  }

  /**
   * Creates an LLM service instance from environment variables
   */
  static fromEnvironment(): LLMService {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is required');
    }

    return new LLMService({
      apiKey,
      model: process.env.LLM_MODEL || 'gemini-2.0-flash-exp',
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '1000'),
      temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.1')
    });
  }
}