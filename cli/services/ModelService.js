import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

class ModelService {
    constructor() {
        this.endpoints = {
            'gemini-flash': {
                url: process.env.GEMINI_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
                }
            },
            'gpt-4o': {
                url: process.env.OPENAI_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            },
            'claude-sonnet': {
                url: process.env.CLAUDE_ENDPOINT || 'https://api.anthropic.com/v1/messages',
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01',
                    'x-api-key': process.env.CLAUDE_API_KEY
                }
            }
        };
    }

    /**
     * Execute a task using the specified model
     */
    async executeTask(model, prompt, options = {}) {
        const endpoint = this.endpoints[model];
        if (!endpoint) {
            throw new Error(`Unknown model: ${model}`);
        }

        const payload = this.formatPayload(model, prompt, options);

        try {
            const response = await axios.post(endpoint.url, payload, {
                headers: endpoint.headers
            });

            // Write response to task output file
            if (options.outputPath) {
                await this.writeOutput(options.outputPath, {
                    prompt,
                    response: response.data,
                    model,
                    timestamp: new Date().toISOString()
                });
            }

            return {
                status: 'success',
                model,
                response: response.data,
                usage: response.data.usage || {}
            };

        } catch (error) {
            console.error(`Error calling ${model}:`, error.message);
            throw error;
        }
    }

    /**
     * Format the API payload based on the model
     */
    formatPayload(model, prompt, options) {
        switch (model) {
            case 'gemini-flash':
                return {
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 8192
                    }
                };

            case 'gpt-4o':
                return {
                    model: 'gpt-4',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 8192
                };

            case 'claude-sonnet':
                return {
                    model: 'claude-3-sonnet-20240229',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 8192
                };

            default:
                throw new Error(`Unknown model: ${model}`);
        }
    }

    /**
     * Write task output to file
     */
    async writeOutput(outputPath, data) {
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(
            outputPath,
            JSON.stringify(data, null, 2),
            'utf8'
        );
    }
}

export default ModelService;