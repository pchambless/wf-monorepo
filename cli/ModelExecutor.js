import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import ModelService from './services/ModelService.js';

class ModelExecutor {
    constructor() {
        this.modelService = new ModelService();
    }

    async executeTask(routing, prompt) {
        const { model, plan, taskId } = routing;
        const taskDir = path.join(process.cwd(), '.kiro', plan, 'tasks');

        // Create task output directory if it doesn't exist
        await fs.mkdir(taskDir, { recursive: true });

        const outputPath = path.join(taskDir, `${taskId}-output.json`);
        const logPath = path.join(taskDir, `${taskId}-${model}.log`);

        console.log(`\nRouting task ${taskId} to ${model}...`);

        try {
            const result = await this.modelService.executeTask(model, prompt, {
                outputPath,
                routing
            });

            // Log execution details
            await fs.writeFile(logPath, JSON.stringify({
                timestamp: new Date().toISOString(),
                model,
                task: taskId,
                prompt,
                complexity: routing.complexity,
                estimatedTokens: routing.estimatedTokens,
                result: result
            }, null, 2));

            return {
                status: 'completed',
                model,
                outputPath,
                logPath,
                usage: result.usage
            };

        } catch (error) {
            console.error(`Error executing task:`, error);
            throw error;
        }
    }
}

export default ModelExecutor;