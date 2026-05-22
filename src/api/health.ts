/**
 * Health API
 * API health check endpoints
 */

import axios from './axios-helper';

export interface HealthStatus {
  status: string;
  service: string;
  timestamp: string;
  version: string;
}

export const healthApi = {
  /**
   * Check API health status
   */
  checkHealth: async (): Promise<HealthStatus> => {
    const response = await axios.get<HealthStatus>('/health');
    return response.data;
  },
};
