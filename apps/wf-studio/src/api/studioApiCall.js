/**
 * Generic Studio API Call Handler
 * Handles all studio API calls with consistent configuration and error handling
 */

import { getEndpointUrl } from './config.js';

/**
 * Generic studio API call function
 * @param {string} endpointName - Name of the endpoint (execApps, execPages, etc.)
 * @param {Object} params - Parameters object like {":appID": "studio"}
 * @param {Object} config - API configuration {baseUrl, logger}
 * @returns {Promise<Object>} - API response
 */
export async function studioApiCall(endpointName, params = {}, config = {}) {
  try {
    const { baseUrl = "http://localhost:3001", logger = console } = config;

    // Get endpoint URL
    const baseUrl_endpoint = getEndpointUrl(endpointName);

    // Build URL with query parameters for GET requests
    const url = new URL(baseUrl_endpoint, baseUrl);

    // For endpoints that expect 'params' wrapper, add it
    if (endpointName !== 'getDoc') {
      url.searchParams.append('params', JSON.stringify(params));
    } else {
      // For getDoc, add parameters directly
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    logger.log(`🚀 Studio API: GET ${url.href}`, { endpointName, params });

    // All studio API calls are now GET with query params
    const requestOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    // Make the API call
    const response = await fetch(url.href, requestOptions);
    
    if (!response.ok) {
      // Try to extract error details from response body
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error || errorData.message) {
          errorMessage = errorData.error || errorData.message;
          logger.error(`❌ Server error details:`, errorData);
        }
      } catch (parseError) {
        // If response isn't JSON, use default error message
      }
      throw new Error(errorMessage);
    }
    
    // Handle different response types based on endpoint
    let data;
    if (endpointName === 'getDoc') {
      // getDoc returns raw text content, not JSON
      data = await response.text();
    } else {
      // Other endpoints return JSON
      data = await response.json();
    }

    logger.log(`✅ Studio API: ${endpointName} success`, data);

    return data;
    
  } catch (error) {
    const errorMsg = `❌ Studio API ${endpointName} failed: ${error.message}`;
    config?.logger?.error(errorMsg);
    throw new Error(errorMsg);
  }
}