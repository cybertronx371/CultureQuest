import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";
import type { ChatbotConfig } from "@shared/schema";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class ChatbotService {
  private openai?: OpenAI;
  private gemini?: GoogleGenAI;
  private config?: ChatbotConfig;

  async initialize() {
    this.config = await storage.getActiveChatbotConfig();
    if (!this.config) {
      throw new Error('No active chatbot configuration found');
    }

    switch (this.config.provider) {
      case 'openai':
        this.openai = new OpenAI({ apiKey: this.config.apiKey });
        break;
      case 'gemini':
        this.gemini = new GoogleGenAI({ apiKey: this.config.apiKey });
        break;
      case 'deepseek':
        // DeepSeek uses OpenAI-compatible API
        this.openai = new OpenAI({ 
          apiKey: this.config.apiKey,
          baseURL: 'https://api.deepseek.com'
        });
        break;
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    if (!this.config) {
      await this.initialize();
    }

    const systemMessage = `You are an ISP (Internet Service Provider) customer support assistant. You help customers with:
- Internet connection issues and troubleshooting
- Package information and upgrades
- Billing questions and payment issues
- Technical support for routers and equipment
- Service area coverage questions
- Account management

Be helpful, professional, and provide accurate information. If you cannot help with something specific, politely direct them to contact human support.`;

    try {
      switch (this.config!.provider) {
        case 'openai':
        case 'deepseek':
          return await this.generateOpenAIResponse(messages, systemMessage);
        case 'gemini':
          return await this.generateGeminiResponse(messages, systemMessage);
        default:
          throw new Error(`Unsupported provider: ${this.config!.provider}`);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  private async generateOpenAIResponse(messages: ChatMessage[], systemMessage: string): Promise<string> {
    if (!this.openai) throw new Error('OpenAI client not initialized');

    const response = await this.openai.chat.completions.create({
      model: this.config!.model,
      messages: [
        { role: 'system', content: systemMessage },
        ...messages
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  }

  private async generateGeminiResponse(messages: ChatMessage[], systemMessage: string): Promise<string> {
    if (!this.gemini) throw new Error('Gemini client not initialized');

    // Convert messages to Gemini format
    const conversationHistory = messages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    const prompt = `${systemMessage}\n\nConversation:\n${conversationHistory}\n\nAssistant:`;

    const response = await this.gemini.models.generateContent({
      model: this.config!.model,
      contents: prompt,
    });

    return response.text || 'Sorry, I could not generate a response.';
  }

  getAvailableModels(provider: string): string[] {
    switch (provider) {
      case 'openai':
        return ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
      case 'gemini':
        return ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'];
      case 'deepseek':
        return ['deepseek-chat', 'deepseek-coder'];
      default:
        return [];
    }
  }
}

export const chatbotService = new ChatbotService();