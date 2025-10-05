/**
 * execFunction - Direct Function Call Executor
 * Handles direct function call format in workflow actions
 * Example: { action: "setVal('appID', {{this.selected.value}})" }
 */

import { parse } from '@babel/parser';

export class ExecFunction {
  constructor(workflowEngine) {
    this.workflowEngine = workflowEngine;
    // Don't capture contextStore here - access it dynamically via workflowEngine
  }

  get contextStore() {
    return this.workflowEngine.contextStore;
  }

  /**
   * Execute direct function call format
   * @param {Object} action - Action with direct call string
   * @param {Object} data - Context data for template resolution
   * @param {Object} sourceEventType - Source event type context
   */
  async execute(action, data, sourceEventType) {
    try {
      let functionCall = action.action;
      
      console.log(`🔧 Processing function call: ${functionCall}`);
      
      // Resolve {{}} templates with actual values from data
      functionCall = this.resolveTemplates(functionCall, data);
      
      console.log(`🔧 Resolved function call: ${functionCall}`);
      
      // Parse and execute the function call
      return await this.parseAndExecute(functionCall, data);
      
    } catch (error) {
      console.error(`❌ Function execution failed:`, error);
      return { error: error.message };
    }
  }

  /**
   * Resolve {{}} template expressions
   */
  resolveTemplates(functionCall, data) {
    return functionCall.replace(/\{\{this\.([^}]+)\}\}/g, (match, path) => {
      // Extract nested property: "selected.value" -> data.selected.value
      const value = path.split('.').reduce((obj, key) => obj?.[key], data);
      return typeof value === 'string' ? `'${value}'` : value;
    });
  }

  /**
   * Parse function call and execute it using babel-parser
   */
  async parseAndExecute(functionCall, data) {
    try {
      // Parse the function call as a JavaScript expression
      const ast = parse(functionCall, {
        sourceType: 'script',
        plugins: []
      });

      // Extract the call expression (should be the only statement)
      const statements = ast.program.body;
      if (!statements || statements.length === 0) {
        throw new Error(`No statements found in parsed function call: ${functionCall}`);
      }

      const statement = statements[0];
      if (statement.type !== 'ExpressionStatement' || statement.expression.type !== 'CallExpression') {
        throw new Error(`Expected function call, got: ${statement.type}`);
      }
      
      const callExpression = statement.expression;
      const methodName = callExpression.callee.name;
      
      // Extract arguments from AST
      const args = callExpression.arguments.map(arg => this.evaluateASTNode(arg));
      
      console.log(`🔧 Calling ${methodName} with args:`, args);
      
      // Route to appropriate handler
      return await this.executeMethod(methodName, args, data);
      
    } catch (error) {
      throw new Error(`Failed to parse function call "${functionCall}": ${error.message}`);
    }
  }

  /**
   * Evaluate AST node to JavaScript value
   */
  evaluateASTNode(node) {
    switch (node.type) {
      case 'StringLiteral':
        return node.value;
      
      case 'NumericLiteral':
        return node.value;
      
      case 'BooleanLiteral':
        return node.value;
      
      case 'ArrayExpression':
        return node.elements.map(element => this.evaluateASTNode(element));
      
      case 'ObjectExpression':
        const obj = {};
        node.properties.forEach(prop => {
          const key = prop.key.type === 'Identifier' ? prop.key.name : this.evaluateASTNode(prop.key);
          const value = this.evaluateASTNode(prop.value);
          obj[key] = value;
        });
        return obj;
      
      case 'Identifier':
        // For now, return the identifier name as string
        // Could be enhanced to resolve variables
        return node.name;
      
      default:
        throw new Error(`Unsupported AST node type: ${node.type}`);
    }
  }

  /**
   * Execute the parsed method call
   */
  async executeMethod(methodName, args, data) {
    switch (methodName) {
      case 'setVal':
      case 'clearVals':
        return this.contextStore[methodName](...args);
        
      case 'refresh':
        return this.workflowEngine.refresh({ targets: args[0] }, data);
        
      case 'studioApiCall':
        const [endpoint, params] = args;

        // Process params if it's an array of getVal calls (like ["getVal('appID')"])
        let processedParams = params;
        if (Array.isArray(params)) {
          processedParams = await this.workflowEngine.resolveParams(params);
        }

        return this.workflowEngine.studioApiCall({ endpoint, params: processedParams }, data);
        
      default:
        // Try to call method on WorkflowEngine
        const method = this.workflowEngine[methodName];
        if (typeof method === 'function') {
          return await method.call(this.workflowEngine, ...args);
        } else {
          throw new Error(`Unknown method: ${methodName}`);
        }
    }
  }

  /**
   * Check if an action is a function call format
   */
  static isFunctionCall(action) {
    return typeof action === 'object' && 
           action.action && 
           typeof action.action === 'string' && 
           action.action.includes('(');
  }
}