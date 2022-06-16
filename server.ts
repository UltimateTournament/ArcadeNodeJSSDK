import { dLog } from './logging'
import axios from 'axios'
import { ActivateSlipResponse, GetServerStatusResponse, HeartbeatIndex, ScoreReport } from './types'

export default class ArcadeServerSDK {

  url = process.env["UAHV_ADDR"] || "http://localhost:8083"
  debug = process.env['ARCADE_DEBUG'] === '1' // debug logging
  heartbeatIndex: HeartbeatIndex = {}
  poolHeartbeat?: NodeJS.Timer

  constructor() {
    dLog("starting arcade server sdk")
  }

  async getServerStatus(): Promise<GetServerStatusResponse> {
    // we're retrying indefinitely here because servers might be spun up without a game session
    // and only after a long time get assigned one
    while (true) {
      try {
        const res = await axios.get<GetServerStatusResponse>(this.url + '/api/server')
        return res.data
      } catch (error) {
        // Server not ready yet, sleep and try again
        await new Promise(r => setTimeout(r, 100))
      }
    }
  }

  /**
   * Shuts down the game server. The hypervisor will send a termination signal to the server shortly after.
   */
  async shutdown() {
    await axios.post(this.url + '/api/server/shutdown')
  }

  /**
   * Activates a player slip, returns information about the player
   * @param playerToken The token provided by the player during connection
   */
  async activateSlip(playerToken: string): Promise<ActivateSlipResponse> {
    const res = await axios.post<ActivateSlipResponse>(this.url + '/api/player/activate', {}, {
      headers: {
        'Authorization': `Bearer ${playerToken}`
      }
    })

    // Launch heartbeat interval
    this.heartbeatIndex[playerToken] = setTimeout(() => {
      this.heartbeatSlip(playerToken)
    }, 10000);

    return res.data
  }

  /**
   * Heartbeats a player's slip
   * @param playerToken The player's token
   */
  private async heartbeatSlip(playerToken: string): Promise<void> {
    await axios.post(this.url + '/api/player/heartbeat', {}, {
      headers: {
        'Authorization': `Bearer ${playerToken}`
      }
    })
  }

  /**
   * Settle the player's slip without them being defeated. Used when they want to cash-out of a long-running game.
   * @param playerToken The player's token
   */
  async settleSlip(playerToken: string): Promise<void> {
    await axios.post(this.url + '/api/player/settle', {}, {
      headers: {
        'Authorization': `Bearer ${playerToken}`
      }
    })

    // Remove slip heartbeat
    if (this.heartbeatIndex[playerToken]) {
      clearTimeout(this.heartbeatIndex[playerToken])
    }
  }

  /**
   * Close player session and report score. This should only be used for Leaderboard games (where it's the only call that should be used to close the session)
   * @param playerToken The player's token
   * @param scoreReport The player's score
   */
  async reportPlayerScore(playerToken: string, scoreReport: ScoreReport): Promise<void> {
    await axios.post(this.url + '/api/player/report-score', scoreReport, {
      headers: {
        'Authorization': `Bearer ${playerToken}`
      }
    })
  }

  /**
   * Close player session as they lost against someone
   * @param defeatedPlayerToken The defeated player's token
   * @param winningPlayerToken The winning player's token
   */
  async playerDefeated(defeatedPlayerToken: string, winningPlayerToken: string): Promise<void> {
    await axios.post(this.url + '/api/player/defeat', {
      winner_token: winningPlayerToken
    }, {
      headers: {
        'Authorization': `Bearer ${defeatedPlayerToken}`
      }
    })
    // Remove slip heartbeat
    if (this.heartbeatIndex[defeatedPlayerToken]) {
      clearTimeout(this.heartbeatIndex[defeatedPlayerToken])
    }
  }

  /**
   * Close player session as they lost against the environment (ex: ran into a wall). They will lose some of their tokens.
   * @param defeatedPlayerToken The defeated player's token
   */
  async playerSelfDefeat(defeatedPlayerToken: string): Promise<void> {
    await axios.post(this.url + '/api/player/self-defeat', {}, {
      headers: {
        'Authorization': `Bearer ${defeatedPlayerToken}`
      }
    })
  }

  /**
   * Close player session as they lost against the environment (ex: ran into a wall). They will lose some of their tokens.
   */
  async heartbeatPool(): Promise<void> {
    await axios.post(this.url + '/api/pool/heartbeat', {
    })
  }

  /**
   * Starts a background worker that will heartbeat the pool. The worker will automatically be stopped when a pool is settled. It will also immediately send an initial heartbeat.
   */
  startPoolHeartbeatLoop(): void {
    this.heartbeatPool()
    this.poolHeartbeat = setInterval(() => {
      this.heartbeatPool()
    }, 10000)
  }

  /**
   * Locks a pool so that no more players can join, and any player that disconnects loses.
   */
  async lockPool(): Promise<void> {
    await axios.post(this.url + '/api/pool/lock', {
    })
  }

  /**
   * Returns a pool when no winner can be determined. All remaining players will have the pool tokens evenly distributed. Players that have already lose will not get their tokens returned.
   * @param reason The reason that the pool was returned. For example 'players tied'
   */
  async returnPool(reason: string): Promise<void> {
    await axios.post(this.url + '/api/pool/return', {
      reason
    })
    // Stop the pool heartbeat
    if (this.poolHeartbeat) {
      clearTimeout(this.poolHeartbeat)
    }
  }

  /**
   * Settles a pool with a winning player. This player will get all of the tokens within the pool. All other players must have had `defeatPlayer()` called on them, otherwise this call will fail.
   * @param playerToken The token of the winning player
   */
  async settlePool(playerToken: string): Promise<void> {
    await axios.post(this.url + '/api/pool/settle', {
    }, {
      headers: {
        'Authorization': `Bearer ${playerToken}`
      }
    })

    // Stop the pool heartbeat
    if (this.poolHeartbeat) {
      clearTimeout(this.poolHeartbeat)
    }
  }

}
