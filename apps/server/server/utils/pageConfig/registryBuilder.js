/**
 * Registry Builder - Handles eventType file discovery and registry building
 */

import { promises as fs } from 'fs';
import path from 'path';
import logger from "../logger.js";

const codeName = "[registryBuilder.js]";

/**
 * Build registry of all eventType files in the page folder
 */
export async function buildEventTypeRegistry(basePath) {
  const registry = new Map();
  
  async function scanDirectory(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          await scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          // Extract eventType name from filename (remove .js)
          const eventTypeName = entry.name.replace('.js', '');
          
          // Quick validation - check if file has content and valid export
          try {
            const content = await fs.readFile(fullPath, 'utf8');
            if (!content.trim()) {
              logger.debug(`${codeName} Skipping empty file: ${eventTypeName}`);
              continue;
            }
            if (!content.includes('export')) {
              logger.debug(`${codeName} Skipping file without export: ${eventTypeName}`);
              continue;
            }
            
            registry.set(eventTypeName, fullPath);
            logger.debug(`${codeName} Registry: ${eventTypeName} -> ${fullPath}`);
          } catch (error) {
            logger.debug(`${codeName} Skipping unreadable file: ${eventTypeName} - ${error.message}`);
          }
        }
      }
    } catch (error) {
      logger.debug(`${codeName} Could not scan directory ${dirPath}: ${error.message}`);
    }
  }
  
  await scanDirectory(basePath);
  logger.debug(`${codeName} Built registry with ${registry.size} eventTypes`);
  return registry;
}