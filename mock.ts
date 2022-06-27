import { ActivatePlayerResponse, GetServerStatusResponse, ScoreReport } from './types'

export default class Mock {

  constructor() {
    console.log("UA SDK running in mock mode")
  }

  async getServerStatus(): Promise<GetServerStatusResponse> {
    return  {
      random_seed: "not-random",
    }
  }

  async shutdown() {
  }

  async activatePlayer(playerToken: string): Promise<ActivatePlayerResponse> {
    return {
      display_name: "Mock Player",
      player_id: "p1",
    }
  }

  async settlePlayer(playerToken: string): Promise<void> {
  }

  async reportPlayerScore(playerToken: string, scoreReport: ScoreReport): Promise<void> {
  }

  async playerDefeated(defeatedPlayerToken: string, winningPlayerToken: string): Promise<void> {
  }

  async playerSelfDefeat(defeatedPlayerToken: string): Promise<void> {
  }

  async lockPool(): Promise<void> {
  }

  async returnPool(reason: string): Promise<void> {
  }

  async settlePool(playerToken: string): Promise<void> {
  }

}
