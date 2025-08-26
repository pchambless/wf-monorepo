/**
 * Registry Builder - Auto-extracts agent capabilities from .md files
 * Builds in-memory registry on every call - no caching, no persistence
 * 
 * Location: .claude/routing/RegistryBuilder.js
 * Philosophy: Single source of truth in agent .md files
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class RegistryBuilder {
  constructor() {
    this.agentsPath = join(__dirname, '../agents');
  }

  /**
   * Build fresh registry from agent .md files
   * Returns in-memory registry object
   */
  buildRegistry() {
    const registry = {};

    if (!existsSync(this.agentsPath)) {
      console.warn(`Agents directory not found: ${this.agentsPath}`);
      return registry;
    }

    const files = readdirSync(this.agentsPath).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      try {
        const agentName = file.replace('.md', '');
        const agentPath = join(this.agentsPath, file);
        const agentConfig = this.extractAgentConfig(agentPath);
        
        if (agentConfig) {
          registry[agentName] = agentConfig;
        }
      } catch (error) {
        console.error(`Failed to process agent ${file}:`, error.message);
      }
    }

    return registry;
  }

  /**
   * Extract agent configuration from .md file
   */
  extractAgentConfig(filePath) {
    const content = readFileSync(filePath, 'utf8');
    const { frontmatter, body } = this.parseFrontmatter(content);
    
    if (!frontmatter.name) {
      console.warn(`Agent missing name in frontmatter: ${filePath}`);
      return null;
    }

    return {
      domains: this.extractDomains(body, frontmatter),
      capabilities: this.extractCapabilities(body, frontmatter),
      contextLimits: this.extractContextLimits(body, frontmatter),
      model: frontmatter.model || "claude-sonnet-4-20250514",
      availability: frontmatter.availability || "active",
      expertise: this.calculateExpertise(body, frontmatter),
      description: frontmatter.description || "Auto-extracted agent",
      color: frontmatter.color || "gray"
    };
  }

  /**
   * Parse frontmatter from markdown content
   */
  parseFrontmatter(content) {
    const lines = content.split('\n');
    let frontmatterEnd = -1;
    let frontmatterStart = -1;

    // Find frontmatter boundaries
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        if (frontmatterStart === -1) {
          frontmatterStart = i;
        } else {
          frontmatterEnd = i;
          break;
        }
      }
    }

    if (frontmatterStart === -1 || frontmatterEnd === -1) {
      return { frontmatter: {}, body: content };
    }

    // Parse YAML frontmatter
    const frontmatterLines = lines.slice(frontmatterStart + 1, frontmatterEnd);
    const frontmatter = {};
    
    for (const line of frontmatterLines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        frontmatter[key] = value;
      }
    }

    const body = lines.slice(frontmatterEnd + 1).join('\n');
    return { frontmatter, body };
  }

  /**
   * Extract domains from agent content
   */
  extractDomains(body, frontmatter) {
    // Check frontmatter first
    if (frontmatter.domains) {
      return frontmatter.domains.split(',').map(d => d.trim());
    }

    // Infer from content analysis sections
    const domains = new Set();
    const content = body.toLowerCase();

    // Domain inference patterns
    const domainPatterns = {
      'eventTypes': ['eventtypes', 'event types', 'workflow'],
      'react': ['react', 'component', 'jsx', 'ui'],
      'sql': ['sql', 'schema', 'database'],
      'workflows': ['workflow', 'trigger', 'integration'],
      'ui': ['layout', 'design', 'accessibility'],
      'codeAnalysis': ['dead code', 'dependencies', 'analysis'],
      'infrastructure': ['infrastructure', 'routing', 'app startup'],
      'routing': ['routing', 'routes', 'navigation']
    };

    Object.entries(domainPatterns).forEach(([domain, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        domains.add(domain);
      }
    });

    return Array.from(domains);
  }

  /**
   * Extract capabilities from agent content
   */
  extractCapabilities(body, frontmatter) {
    // Check frontmatter first
    if (frontmatter.capabilities) {
      return frontmatter.capabilities.split(',').map(c => c.trim());
    }

    // Infer from analysis sections
    const capabilities = new Set();
    const content = body.toLowerCase();

    // Look for numbered analysis sections and patterns
    const analysisPatterns = {
      'structure-validation': ['imports', 'dependencies', 'structure'],
      'routing-configuration': ['routing', 'routes', 'navigation'],
      'component-analysis': ['components', 'lazy loading', 'error boundaries'],
      'environment-validation': ['environment', 'variables', 'config'],
      'pattern-analysis': ['conventions', 'patterns', 'best practices'],
      'imports-and-dependencies': ['imports', 'dependencies', 'modules'],
      'app-startup': ['app entry point', 'startup', 'providers'],
      'error-boundaries': ['error boundaries', 'fallbacks'],
      'infrastructure-analysis': ['infrastructure', 'foundational']
    };

    Object.entries(analysisPatterns).forEach(([capability, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        capabilities.add(capability);
      }
    });

    return Array.from(capabilities);
  }

  /**
   * Extract context limits from agent content or frontmatter
   */
  extractContextLimits(body, frontmatter) {
    // Default limits based on agent complexity
    const defaults = { optimal: 6000, maximum: 12000 };

    if (frontmatter.contextLimits) {
      const [optimal, maximum] = frontmatter.contextLimits.split(',').map(n => parseInt(n.trim()));
      return { optimal: optimal || defaults.optimal, maximum: maximum || defaults.maximum };
    }

    // Infer from content complexity
    const contentLength = body.length;
    if (contentLength > 3000) {
      return { optimal: 8000, maximum: 16000 }; // Complex agent
    }
    if (contentLength > 1500) {
      return { optimal: 6000, maximum: 12000 }; // Medium agent  
    }
    return { optimal: 4000, maximum: 8000 }; // Simple agent
  }

  /**
   * Calculate expertise scores from agent content
   */
  calculateExpertise(body, frontmatter) {
    const domains = this.extractDomains(body, frontmatter);
    const expertise = {};

    // Analyze content depth for each domain
    const content = body.toLowerCase();
    
    domains.forEach(domain => {
      let score = 60; // Base score
      
      // Boost score based on content analysis depth
      if (content.includes('detailed') || content.includes('comprehensive')) {
        score += 20;
      }
      if (content.includes('best practices') || content.includes('standards')) {
        score += 15;
      }
      if (content.includes('structured analysis') || content.includes('systematic')) {
        score += 10;
      }
      
      // Domain-specific scoring
      switch (domain) {
        case 'react':
          if (content.includes('component') && content.includes('patterns')) score += 15;
          break;
        case 'eventTypes':
          if (content.includes('validation') && content.includes('workflow')) score += 20;
          break;
        case 'sql':
          if (content.includes('schema') && content.includes('validation')) score += 15;
          break;
        case 'infrastructure':
          if (content.includes('routing') && content.includes('configuration')) score += 15;
          break;
        case 'routing':
          if (content.includes('routes') && content.includes('navigation')) score += 15;
          break;
      }

      expertise[domain] = Math.min(score, 95); // Cap at 95
    });

    return expertise;
  }
}

export default RegistryBuilder;