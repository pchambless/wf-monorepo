/**
 * Agent Router - Intelligent routing for expertise-based task assignment
 * Routes tasks to specialized agents based on domain expertise
 * 
 * Location: .claude/routing/ (co-located with agent definitions)
 * Philosophy: Clean slate - no backwards compatibility with complexity system
 */

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import RegistryBuilder from './RegistryBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AgentRouter {
  constructor() {
    this.fallbackAgent = "EventParser"; // Most general agent
    this.registryBuilder = new RegistryBuilder();
  }

  /**
   * Route a task to the best agent based on domain and requirements
   * @param {Object} taskMetadata - Task metadata with domain, capability, context requirements
   * @returns {Object} Routing decision with agent assignment
   */
  routeTask(taskMetadata) {
    const { domain, capability, contextSize, requirements } = taskMetadata;
    
    let selectedAgent = null;
    let reasoning = "fallback";
    let confidence = 0;

    // Primary routing: domain + capability matching
    if (domain && capability) {
      const candidates = this.findCandidateAgents(domain, capability);
      if (candidates.length > 0) {
        selectedAgent = this.selectBestAgent(candidates, taskMetadata);
        reasoning = "domain-capability-match";
        confidence = this.calculateConfidence(selectedAgent, taskMetadata);
      }
    }
    // Secondary routing: domain-only matching
    else if (domain) {
      const bestAgent = this.getBestAgentForDomain(domain);
      if (bestAgent) {
        selectedAgent = bestAgent;
        reasoning = "domain-match";
        confidence = this.calculateConfidence(selectedAgent, taskMetadata);
      }
    }
    // Fallback routing
    if (!selectedAgent) {
      selectedAgent = this.getFallbackAgent();
      reasoning = "fallback";
      confidence = 0.3;
    }

    return {
      agent: selectedAgent.name,
      model: selectedAgent.model,
      reasoning,
      confidence,
      contextOptimization: this.optimizeContext(selectedAgent, contextSize),
      fallbackOptions: this.getFallbackOptions(domain, capability)
    };
  }

  /**
   * Registry access methods
   */
  getAgentRegistry() {
    return this.registryBuilder.buildRegistry();
  }

  getAgentsByDomain(domain) {
    const registry = this.registryBuilder.buildRegistry();
    return Object.entries(registry)
      .filter(([, agent]) => agent.domains.includes(domain))
      .map(([name, agent]) => ({ name, ...agent }));
  }

  getAgentsByCapability(capability) {
    const registry = this.registryBuilder.buildRegistry();
    return Object.entries(registry)
      .filter(([, agent]) => agent.capabilities.includes(capability))
      .map(([name, agent]) => ({ name, ...agent }));
  }

  getBestAgentForDomain(domain, capability = null) {
    const candidates = this.getAgentsByDomain(domain);
    
    if (capability) {
      const capableCandidates = candidates.filter(agent => 
        agent.capabilities.includes(capability)
      );
      if (capableCandidates.length > 0) {
        return capableCandidates.reduce((best, current) => {
          const bestScore = best.expertise?.[domain] || 0;
          const currentScore = current.expertise?.[domain] || 0;
          return currentScore > bestScore ? current : best;
        });
      }
    }
    
    return candidates.reduce((best, current) => {
      const bestScore = best.expertise?.[domain] || 0;
      const currentScore = current.expertise?.[domain] || 0;
      return currentScore > bestScore ? current : best;
    }, candidates[0]);
  }

  /**
   * Find candidate agents based on domain and capability
   */
  findCandidateAgents(domain, capability) {
    const domainAgents = this.getAgentsByDomain(domain);
    const capabilityAgents = this.getAgentsByCapability(capability);
    
    // Find intersection - agents that have both domain AND capability
    return domainAgents.filter(agent => 
      capabilityAgents.some(capAgent => capAgent.name === agent.name)
    );
  }

  /**
   * Select best agent from candidates using expertise scoring
   */
  selectBestAgent(candidates, taskMetadata) {
    return candidates.reduce((best, current) => {
      const bestScore = this.calculateAgentScore(best, taskMetadata);
      const currentScore = this.calculateAgentScore(current, taskMetadata);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Calculate agent suitability score for a task
   */
  calculateAgentScore(agent, taskMetadata) {
    const { domain, capability, contextSize = 5000 } = taskMetadata;
    
    let score = 0;
    
    // Domain expertise score (0-100)
    const domainScore = agent.expertise?.[domain] || 0;
    score += domainScore * 0.4;
    
    // Capability match score
    const hasCapability = agent.capabilities.includes(capability) ? 50 : 0;
    score += hasCapability * 0.3;
    
    // Context efficiency score (prefer agents with optimal context size)
    const contextEfficiency = this.calculateContextEfficiency(agent, contextSize);
    score += contextEfficiency * 0.2;
    
    // Availability score
    const availabilityScore = agent.availability === 'active' ? 10 : 0;
    score += availabilityScore * 0.1;
    
    return score;
  }

  /**
   * Calculate context efficiency score
   */
  calculateContextEfficiency(agent, requiredContext) {
    const optimal = agent.contextLimits?.optimal || 5000;
    const maximum = agent.contextLimits?.maximum || 10000;
    
    if (requiredContext <= optimal) return 100;
    if (requiredContext <= maximum) return 70;
    return 30; // Over limits, but might work with trimming
  }

  /**
   * Optimize context size for selected agent
   */
  optimizeContext(agent, requestedSize) {
    const optimal = agent.contextLimits?.optimal || 5000;
    const maximum = agent.contextLimits?.maximum || 10000;
    
    if (!requestedSize) return { recommended: optimal, strategy: "default" };
    
    if (requestedSize <= optimal) {
      return { recommended: requestedSize, strategy: "as-requested" };
    }
    
    if (requestedSize <= maximum) {
      return { 
        recommended: Math.min(requestedSize, maximum), 
        strategy: "within-limits" 
      };
    }
    
    return { 
      recommended: maximum, 
      strategy: "trim-to-maximum",
      trimAmount: requestedSize - maximum 
    };
  }

  /**
   * Calculate routing confidence score
   */
  calculateConfidence(agent, taskMetadata) {
    const { domain, capability } = taskMetadata;
    
    let confidence = 0;
    
    // Domain match confidence
    if (agent.domains.includes(domain)) {
      const expertiseScore = agent.expertise?.[domain] || 0;
      confidence += expertiseScore / 100 * 0.6;
    }
    
    // Capability match confidence  
    if (agent.capabilities.includes(capability)) {
      confidence += 0.4;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Get fallback options for failed primary routing
   */
  getFallbackOptions(domain, capability) {
    const options = [];
    
    // Domain-only fallbacks
    if (domain) {
      const domainAgents = this.getAgentsByDomain(domain);
      options.push(...domainAgents.slice(0, 2).map(agent => ({
        agent: agent.name,
        reason: "domain-fallback",
        confidence: this.calculateConfidence(agent, { domain, capability }) * 0.8
      })));
    }
    
    // General fallback
    options.push({
      agent: this.fallbackAgent,
      reason: "general-fallback", 
      confidence: 0.3
    });
    
    return options.slice(0, 3); // Max 3 fallback options
  }

  /**
   * Get fallback agent instance
   */
  getFallbackAgent() {
    const registry = this.registryBuilder.buildRegistry();
    const fallback = registry[this.fallbackAgent];
    return { name: this.fallbackAgent, ...fallback };
  }

  /**
   * Parse task content to infer domain and capability
   * Replaces complexity inference with domain/capability inference
   */
  inferTaskMetadata(taskContent) {
    const content = taskContent.toLowerCase();
    
    // Domain inference patterns
    const domainPatterns = {
      'eventTypes': ['eventtypes', 'event types', 'component analysis', 'workflow orchestration'],
      'react': ['react', 'component', 'jsx', 'ui', 'frontend'],  
      'workflows': ['workflow', 'trigger', 'integration', 'process'],
      'sql': ['sql', 'schema', 'database', 'table'],
      'ui': ['layout', 'design', 'accessibility', 'ux'],
      'codeAnalysis': ['dead code', 'dependencies', 'cleanup', 'refactor'],
      'infrastructure': ['infrastructure', 'app startup', 'routing', 'configuration', 'app structure', 'wf-plan-management', 'wf-client', 'wf-server'],
      'routing': ['routing', 'routes', 'navigation', 'router']
    };
    
    // Capability inference patterns
    const capabilityPatterns = {
      'structure-validation': ['validation', 'structure', 'validate'],
      'pattern-analysis': ['analysis', 'pattern', 'analyze'],
      'performance-optimization': ['performance', 'optimization', 'optimize'],
      'workflow-validation': ['workflow', 'trigger', 'flow'],
      'dependency-analysis': ['dependency', 'import', 'relationship']
    };
    
    const inferredDomain = this.findBestMatch(content, domainPatterns);
    const inferredCapability = this.findBestMatch(content, capabilityPatterns);
    
    return {
      domain: inferredDomain,
      capability: inferredCapability,
      contextSize: this.estimateContextSize(content),
      confidence: inferredDomain && inferredCapability ? 0.7 : 0.4
    };
  }

  /**
   * Find best pattern match in content
   */
  findBestMatch(content, patterns) {
    let bestMatch = null;
    let maxMatches = 0;
    
    Object.entries(patterns).forEach(([key, keywords]) => {
      const matches = keywords.filter(keyword => content.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = key;
      }
    });
    
    return bestMatch;
  }

  /**
   * Estimate context size needed for task
   */
  estimateContextSize(content) {
    // Simple heuristics based on task complexity indicators
    if (content.includes('architecture') || content.includes('cross-app')) {
      return 12000;
    }
    if (content.includes('analysis') || content.includes('workflow')) {
      return 8000;
    }
    if (content.includes('validation') || content.includes('pattern')) {
      return 6000;
    }
    return 4000; // Default
  }
}

export default AgentRouter;