// In wf-client/src/TestMonorepo.jsx
import { ROUTES } from '@whatsfresh/shared-config';

function TestMonorepo() {
  console.log('Routes from shared config:', ROUTES);
  return (
    <div>
      <h1>Monorepo Test</h1>
      <pre>{JSON.stringify(ROUTES, null, 2)}</pre>
    </div>
  );
}

export default TestMonorepo;
