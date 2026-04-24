export interface DurationValidationResult {
  valid: boolean;
  error?: string;
  message?: string;
  totalDuration: number;
}