#!/usr/bin/env node
import TaskRouter from './TaskRouter.js';

async function main() {
  const [plan, taskId] = process.argv.slice(2);

  if (!plan || !taskId) {
    console.error('\nUsage: route-task <plan> <taskId>');
    console.error('Example: route-task 0040 2.1\n');
    process.exit(1);
  }

  try {
    const router = new TaskRouter();
    const routing = router.routeTask(plan, taskId);
    console.log(JSON.stringify(routing, null, 2));
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
