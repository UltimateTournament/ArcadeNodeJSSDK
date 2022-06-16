export interface GetServerStatusResponse {
  random_seed: string
}

export interface ActivateSlipResponse {
  display_name: string
}

export interface ScoreReport {
  /**
   * MUST be an integer
  */
  score: number
}
