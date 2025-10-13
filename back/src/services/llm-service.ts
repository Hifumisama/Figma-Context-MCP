/**
 * @file LLM Service using Google Cloud Vertex AI (Gemini 2.0 Flash)
 * @description Service for making LLM calls to analyze design patterns and provide structured JSON responses
 * Uses Application Default Credentials (ADC) for authentication
 */

import { VertexAI } from '@google-cloud/vertexai';
import { Logger } from '~/utils/logger.js';

export interface LLMConfig {
  projectId: string;
  location?: string;
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
  private vertexAI: VertexAI;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: LLMConfig) {
    this.model = config.model || 'gemini-2.0-flash-lite-001';
    this.maxTokens = config.maxTokens || 1000;
    this.temperature = config.temperature || 0.1;

    // Initialize Vertex AI with ADC
    this.vertexAI = new VertexAI({
      project: config.projectId,
      location: config.location || 'us-central1'
    });
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
        Logger.log(`LLM call attempt ${attempt}/${retries} with Vertex AI model: ${this.model}`);

        const generativeModel = this.vertexAI.getGenerativeModel({
          model: this.model,
          generationConfig: {
            maxOutputTokens: this.maxTokens,
            temperature: this.temperature,
            responseMimeType: "application/json",
          },
        });

        const result = await generativeModel.generateContent(prompt);
        const response = result.response;
        const candidates = response.candidates;

        if (!candidates || candidates.length === 0) {
          throw new Error('No candidates returned from Vertex AI');
        }

        const content = candidates[0].content;
        if (!content || !content.parts || content.parts.length === 0) {
          throw new Error('No content parts returned from Vertex AI');
        }

        const text = content.parts[0].text;

        if (!text) {
          throw new Error('Empty response from Vertex AI');
        }

        Logger.log('Vertex AI response received, parsing JSON...');

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
        Logger.log(`Vertex AI call failed (attempt ${attempt}/${retries}): ${errorMessage}`);

        if (attempt === retries) {
          return {
            success: false,
            error: `Vertex AI service failed after ${retries} attempts: ${errorMessage}`
          };
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return {
      success: false,
      error: 'Unexpected error in Vertex AI service'
    };
  }


  /**
   * Creates an LLM service instance from environment variables
   * Uses Application Default Credentials (ADC) for authentication
   */
  static fromEnvironment(): LLMService {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;

    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT environment variable is required');
    }

    const config: LLMConfig = {
      projectId,
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
      model: process.env.LLM_MODEL || 'gemini-2.0-flash-exp',
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '8192'),
      temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.9')
    };

    return new LLMService(config);
  }
}
