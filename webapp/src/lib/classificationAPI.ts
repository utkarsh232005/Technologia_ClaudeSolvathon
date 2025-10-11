/**
 * API service for Dark Matter Classification webapp
 * Handles communication with the Flask backend server
 */

// API Configuration
// Use environment variable for production, fallback to local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// API Response Types
export interface ClassificationResult {
  success: boolean;
  classification?: {
    type: string;
    label: string;
    confidence: number;
    severity: string;
    processingTime: number;
  };
  analysis?: {
    keyFeatures: string[];
    reasoning: {
      s2s1Analysis: string;
      energyAnalysis: string;
      positionAnalysis: string;
      pulseCharacteristics: string;
      physicsInterpretation: string;
      comparisonWithLiterature: string;
      alternativeInterpretations: string;
      confidenceFactors: string;
      followUpRecommendations: string;
    };
  };
  error?: string;
  processingTime?: number;
}

export interface BatchResult {
  success: boolean;
  results?: Array<{
    id: string;
    energy: number;
    s1: number;
    s2: number;
    s2s1Ratio: number;
    type: string;
    confidence: number;
    processingTime: number;
    classification: ClassificationResult;
    timestamp: string;
    error?: string;
  }>;
  summary?: {
    totalProcessed: number;
    successful: number;
    errors: number;
    averageProcessingTime: number;
  };
  error?: string;
}

export interface FileUploadResult {
  success: boolean;
  message?: string;
  fileInfo?: {
    filename: string;
    size: number;
    totalEvents: number;
    columns: string[];
  };
  preview?: Record<string, unknown>[];
  tempFilePath?: string;
  error?: string;
}

export interface DatasetInfo {
  success: boolean;
  dataset?: {
    totalEvents: number;
    columns: string[];
    eventTypes: Record<string, number>;
    energyRange: {
      min: number;
      max: number;
    };
    preview: Record<string, unknown>[];
  };
  error?: string;
}

// API Functions
export class ClassificationAPI {
  
  /**
   * Check backend server health
   */
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Backend server is not responding');
    }
  }

  /**
   * Classify a single event
   */
  static async classifySingleEvent(eventData: {
    recoilEnergy: string;
    s1Signal: string;
    s2Signal: string;
    pulseShape?: string;
    positionX?: string;
    positionY?: string;
    positionZ?: string;
    timestamp?: string;
  }): Promise<ClassificationResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/classify/single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Classification failed: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Single event classification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Classification failed',
      };
    }
  }

  /**
   * Upload file for batch processing
   */
  static async uploadBatchFile(file: File): Promise<FileUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/classify/batch`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Upload failed: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Batch file upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Process batch classification
   */
  static async processBatchClassification(tempFilePath: string): Promise<BatchResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/classify/batch/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tempFilePath }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Batch processing failed: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Batch processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch processing failed',
      };
    }
  }

  /**
   * Load dataset information
   */
  static async loadDataset(): Promise<DatasetInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/dataset/load`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Dataset loading failed: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Dataset loading failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Dataset loading failed',
      };
    }
  }

  /**
   * Utility function to check if backend is available
   */
  static async isBackendAvailable(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format classification confidence for display
   */
  static formatConfidence(confidence: number): string {
    if (confidence >= 90) return 'Very High';
    if (confidence >= 80) return 'High';
    if (confidence >= 70) return 'Medium';
    if (confidence >= 60) return 'Low';
    return 'Very Low';
  }

  /**
   * Get classification color based on type
   */
  static getClassificationColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'wimp':
        return 'text-blue-400 border-blue-500/50';
      case 'background':
        return 'text-green-400 border-green-500/50';
      case 'axion':
        return 'text-purple-400 border-purple-500/50';
      case 'neutrino':
        return 'text-orange-400 border-orange-500/50';
      case 'anomaly':
        return 'text-red-400 border-red-500/50';
      default:
        return 'text-gray-400 border-gray-500/50';
    }
  }

  /**
   * Get severity badge color
   */
  static getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  }
}

export default ClassificationAPI;
