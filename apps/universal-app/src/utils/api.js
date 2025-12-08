const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';

export const execEvent = async (eventSQLId, params = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/execEvent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ eventSQLId, params })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`execEvent error (${eventSQLId}):`, error);
    throw error;
  }
};

export const execDml = async (dmlRequest) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/execDML`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dmlRequest)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('execDml error:', error);
    throw error;
  }
};

export const setVals = async (values) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/setVals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ values })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('setVals error:', error);
    throw error;
  }
};

export const getVal = async (paramName, format = 'raw') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/getVal?paramName=${paramName}&format=${format}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`getVal error (${paramName}):`, error);
    throw error;
  }
};
