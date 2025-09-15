/**
 * @file LLM Service using Google Cloud Vertex AI (Gemini 2.0 Flash)
 * @description Service for making LLM calls to analyze design patterns and provide structured JSON responses
 * Uses OAuth2/Service Account authentication through Google Cloud
 */

import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth, JWT, OAuth2Client } from 'google-auth-library';
import { Logger } from '~/utils/logger.js';

export interface LLMConfig {
  projectId: string;
  location?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  // Authentication options
  serviceAccountPath?: string;
  serviceAccountEmail?: string;
  serviceAccountKey?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
  oauthRefreshToken?: string;
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
  private authClient: any = null;

  constructor(config: LLMConfig) {
    this.model = config.model || 'gemini-2.0-flash-exp';
    this.maxTokens = config.maxTokens || 1000;
    this.temperature = config.temperature || 0.1;

    // Initialize authentication
    this.authClient = this.initializeAuth(config);

    // Initialize Vertex AI
    this.vertexAI = new VertexAI({
      project: config.projectId,
      location: config.location || 'us-central1',
      googleAuthOptions: {
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      }
    });
  }

  private initializeAuth(config: LLMConfig): any {
    // Service Account with JSON file path
    if (config.serviceAccountPath) {
      return new JWT({
        keyFile: config.serviceAccountPath,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
    }

    // Service Account with inline credentials
    if (config.serviceAccountEmail && config.serviceAccountKey) {
      return new JWT({
        email: config.serviceAccountEmail,
        key: config.serviceAccountKey,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
    }

    // OAuth2 credentials
    if (config.oauthClientId && config.oauthClientSecret) {
      const oauth2Client = new OAuth2Client({
        clientId: config.oauthClientId,
        clientSecret: config.oauthClientSecret
      });
      
      if (config.oauthRefreshToken) {
        oauth2Client.setCredentials({
          refresh_token: config.oauthRefreshToken
        });
      }
      
      return oauth2Client;
    }

    // Default to Application Default Credentials (ADC)
    return new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
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
        
        // Ensure authentication is valid
        await this.ensureAuthenticated();
        
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
   * Ensures the authentication is valid and refreshes tokens if needed
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.authClient) {
      Logger.log('No explicit authentication configured, using ADC');
      return;
    }
    
    try {
      if (this.authClient instanceof OAuth2Client) {
        // Refresh OAuth2 token if needed
        await this.authClient.getAccessToken();
        Logger.log('OAuth2 token refresh successful');
      } else if (this.authClient instanceof JWT) {
        // Authorize JWT if needed
        await this.authClient.authorize();
        Logger.log('JWT authorization successful');
      } else if (this.authClient instanceof GoogleAuth) {
        // Get ADC client
        await this.authClient.getClient();
        Logger.log('GoogleAuth client obtained successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown auth error';
      Logger.log(`Authentication failed: ${errorMessage}`);
      throw new Error(`Authentication failed: ${errorMessage}`);
    }
  }

  /**
   * Creates an LLM service instance from environment variables
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

    // Add authentication options based on available environment variables
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      config.serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    } else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      config.serviceAccountEmail = process.env.GOOGLE_CLIENT_EMAIL;
      config.serviceAccountKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    } else if (process.env.OAUTH_CLIENT_ID && process.env.OAUTH_CLIENT_SECRET) {
      config.oauthClientId = process.env.OAUTH_CLIENT_ID;
      config.oauthClientSecret = process.env.OAUTH_CLIENT_SECRET;
      config.oauthRefreshToken = process.env.OAUTH_REFRESH_TOKEN;
    }
    // If none of the above are provided, it will use ADC (Application Default Credentials)

    return new LLMService(config);
  }
}
