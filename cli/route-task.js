#!/usr/bin/env node
import { TaskRouter } from './TaskRouter.js';
import ModelExecutor from './ModelExecutor.js';
import fs from 'fs';
import path from 'path';

async function main() {
  const [plan, taskId, ...args] = process.argv.slice(2);
  const execute = args.includes('--execute');

  if (!plan || !taskId) {
    console.error('\nUsage: route-task <plan> <taskId> [--execute]');
    console.error('Example: route-task 0040 2.1 --execute\n');
    process.exit(1);
  }

  try {
    const router = new TaskRouter();
    const routing = await router.routeTask(plan, taskId);

    if (!execute) {
      console.log(JSON.stringify(routing, null, 2));
      return;
    }

    // Load task prompt if executing
    const promptPath = path.join(process.cwd(), '.kiro', plan, 'prompts', `${taskId}.md`);
    const prompt = fs.existsSync(promptPath)
      ? fs.readFileSync(promptPath, 'utf8')
      : routing.taskName;

    const executor = new ModelExecutor();
    const result = await executor.executeTask(routing, prompt);

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
