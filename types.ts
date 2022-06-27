export interface GetServerStatusResponse {
  random_seed: string
}

export interface ActivatePlayerResponse {
  display_name: string
  player_id: string
}

export interface ScoreReport {
  /**
   * MUST be an integer
  */
  score: number
}
