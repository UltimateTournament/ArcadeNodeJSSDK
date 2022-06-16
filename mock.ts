import { ActivateSlipResponse, GetServerStatusResponse, ScoreReport } from './types'

export default class Mock {

  async getServerStatus(): Promise<GetServerStatusResponse> {
    return  {
      random_seed: "not-random",
    }
  }

  async shutdown() {
  }

  async activateSlip(playerToken: string): Promise<ActivateSlipResponse> {
    return {
      display_name: "Mock Player",
    }
  }

  async settleSlip(playerToken: string): Promise<void> {
  }

  async reportPlayerScore(playerToken: string, scoreReport: ScoreReport): Promise<void> {
  }

  async playerDefeated(defeatedPlayerToken: string, winningPlayerToken: string): Promise<void> {
  }

  async playerSelfDefeat(defeatedPlayerToken: string): Promise<void> {
  }

  async heartbeatPool(): Promise<void> {
  }

  startPoolHeartbeatLoop(): void {
  }

  async lockPool(): Promise<void> {
  }

  async returnPool(reason: string): Promise<void> {
  }

  async settlePool(playerToken: string): Promise<void> {
  }

}
