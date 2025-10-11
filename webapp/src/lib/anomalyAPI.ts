/**
 * Anomaly Detection API Integration
 * Connects to the backend anomaly detection system
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface AnomalyFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  value: number;
  weight: number;
}

export interface AnomalyResult {
  event_index: number;
  is_anomaly: boolean;
  anomaly_score: number;
  anomaly_flags: AnomalyFlag[];
  classification: string;
  confidence: number;
  reasoning: string;
  event_data: {
    energy: number;
    s2s1Ratio: number;
    s1: number;
    s2: number;
  };
}

export interface AnomalyDetectionResponse {
  success: boolean;
  anomalies_detected: number;
  total_events_analyzed: number;
  anomaly_rate: number;
  results: AnomalyResult[];
  error?: string;
}

export interface DatasetAnalysisResponse {
  success: boolean;
  statistics: {
    total_analyzed: number;
    anomalies_detected: number;
    anomaly_rate: number;
    by_type: Record<string, number>;
    avg_anomaly_score: number;
  };
  top_anomalies: Array<{
    event_index: number;
    anomaly_score: number;
    classification: string;
    confidence: number;
    energy: number;
    s2s1_ratio: number;
    anomaly_flags: AnomalyFlag[];
  }>;
  error?: string;
}

class AnomalyAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Detect anomalies in event data
   */
  async detectAnomalies(
    events: Array<Record<string, unknown>>,
    options: {
      use_claude?: boolean;
      threshold?: number;
    } = {}
  ): Promise<AnomalyDetectionResponse> {
    try {
      console.log('Sending anomaly detection request with', events.length, 'events');
      console.log('Options:', options);
      
      const response = await fetch(`${this.baseUrl}/api/anomaly/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          use_claude: options.use_claude ?? true,
          threshold: options.threshold ?? 0.3,
        }),
      });

      const data = await response.json();
      console.log('Anomaly detection response:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Anomaly detection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        anomalies_detected: 0,
        total_events_analyzed: 0,
        anomaly_rate: 0,
        results: [],
        error: errorMessage,
      };
    }
  }

  /**
   * Analyze dataset for anomalies
   */
  async analyzeDataset(options: {
    max_events?: number;
    use_claude?: boolean;
    threshold?: number;
  } = {}): Promise<DatasetAnalysisResponse> {
    try {
      console.log('Sending dataset analysis request with options:', options);
      
      const response = await fetch(`${this.baseUrl}/api/anomaly/analyze-dataset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_events: options.max_events ?? 100,
          use_claude: options.use_claude ?? true,
          threshold: options.threshold ?? 0.3,
        }),
      });

      const data = await response.json();
      console.log('Dataset analysis response:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Dataset analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        statistics: {
          total_analyzed: 0,
          anomalies_detected: 0,
          anomaly_rate: 0,
          by_type: {},
          avg_anomaly_score: 0,
        },
        top_anomalies: [],
        error: errorMessage,
      };
    }
  }

  /**
   * Detect anomaly for a single event
   */
  async detectSingleAnomaly(
    event: Record<string, unknown>,
    options: {
      use_claude?: boolean;
      threshold?: number;
    } = {}
  ): Promise<AnomalyDetectionResponse> {
    return this.detectAnomalies([event], options);
  }
}

// Export singleton instance
const anomalyAPI = new AnomalyAPI();
export default anomalyAPI;
