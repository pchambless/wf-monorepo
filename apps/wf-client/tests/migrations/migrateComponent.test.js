const fs = require('fs');
const path = require('path');
const { migrateComponent, transformContextToStore } = require('../../scripts/migrateComponent');

describe('Component Migration', () => {
  const testDir = path.join(__dirname, 'fixtures');
  let componentPath;
  let testDirs = [];

  // Suppress console output during tests
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    testDirs = [
      testDir,
      path.join(testDir, 'components'),
      path.join(testDir, 'context'),
      path.join(testDir, 'stores')
    ];

    // Clean test directories with proper permissions
    if (fs.existsSync(testDir)) {
      fs.chmodSync(testDir, 0o777);
      fs.rmSync(testDir, { recursive: true, force: true });
    }

    // Create directories with proper permissions
    testDirs.forEach(dir => {
      fs.mkdirSync(dir, { recursive: true, mode: 0o777 });
    });
  });

  afterEach(() => {
    // Cleanup with proper permissions
    try {
      testDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
          fs.chmodSync(dir, 0o777);
        }
      });
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  });

  // Test helper function
  const createTestComponent = (name, content) => {
    const filePath = path.join(testDir, 'components', `${name}.js`);
    fs.writeFileSync(filePath, content);
    return filePath;
  };

  it('should transform context names to store names', () => {
    expect(transformContextToStore('ModalContext.js')).toBe('modalStore');
    expect(transformContextToStore('GlobalContext.js')).toBe('globalStore');
  });

  it('should migrate a component from context to store', () => {
    componentPath = createTestComponent('Test', `
      import { useModalContext } from '../context/ModalContext.js';
      
      export function TestComponent() {
        const { isOpen } = useModalContext();
        return isOpen ? <div>Modal</div> : null;
      }
    `);

    const result = migrateComponent('ModalContext.js', componentPath);
    expect(result).toBe(true);

    const content = fs.readFileSync(componentPath, 'utf8');
    expect(content).toContain("import { modalStore } from '../stores/modalStore'");
    expect(content).not.toContain("useModalContext");
    expect(content).toContain("modalStore()");
    expect(fs.existsSync(`${componentPath}.bak`)).toBe(true);
  });

  it('should handle multiple context imports', () => {
    componentPath = createTestComponent('MultiContext', `
      import { useModalContext } from '../context/ModalContext.js';
      import { useGlobalContext } from '../context/GlobalContext.js';
      
      export function MultiContextComponent() {
        const { isOpen } = useModalContext();
        const { theme } = useGlobalContext();
        return isOpen ? <div className={theme}>Modal</div> : null;
      }
    `);

    const result = migrateComponent('ModalContext.js', componentPath);
    expect(result).toBe(true);

    const content = fs.readFileSync(componentPath, 'utf8');
    expect(content).toContain("import { modalStore } from '../stores/modalStore'");
    expect(content).toContain("import { useGlobalContext }");
    expect(content).not.toContain("useModalContext");
    expect(content).toContain("modalStore()");
  });

  it('should handle missing files gracefully', () => {
    const nonExistentPath = path.join(testDir, 'components', 'NonExistent.js');
    const result = migrateComponent('ModalContext.js', nonExistentPath);
    
    expect(result).toBe(false);
  });

  it('should preserve non-migrated contexts', () => {
    componentPath = createTestComponent('MultiContext', `
      import { useModalContext } from '../context/ModalContext.js';
      import { useAuthContext } from '../context/AuthContext.js';
      
      export function MultiContextComponent() {
        const modal = useModalContext();
        const auth = useAuthContext();
        return null;
      }
    `);

    const result = migrateComponent('ModalContext.js', componentPath);
    expect(result).toBe(true);

    const content = fs.readFileSync(componentPath, 'utf8');
    expect(content).toContain("import { modalStore }");
    expect(content).toContain("import { useAuthContext }");
    expect(content).toContain("const auth = useAuthContext()");
    expect(content).not.toContain("useModalContext");
  });
});
