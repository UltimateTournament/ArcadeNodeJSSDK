export interface HeartbeatIndex {
  [key: string]: NodeJS.Timer
}

export interface GetServerStatusResponse {
  random_seed: string
}

export interface ScoreReport {
  /**
   * MUST be an integer
  */
  score: number
}
