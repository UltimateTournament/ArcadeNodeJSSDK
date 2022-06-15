import { dLog } from './logging'
import axios from 'axios'
import { ActivateSlipResponse, GetServerStatusResponse, HeartbeatIndex, ScoreReport } from './types'

const PlayerIDProp = "pid"
const SlipIDProp = "sid"

export default class ArcadeServerSDK {

  url = process.env["UAHV_ADDR"] || "http://localhost:8083"
  debug = process.env['ARCADE_DEBUG'] === '1' // debug logging
  heartbeatIndex: HeartbeatIndex = {}
  poolHeartbeat?: NodeJS.Timer

  constructor() {
    dLog("starting arcade server sdk")
  }

  async getServerStatus(): Promise<GetServerStatusResponse> {
    try {
      let statuscode = 0
      const res = await axios.get(this.url + '/api/server')
      statuscode = res.status
      if (statuscode > 299 && statuscode < 500) {
        throw new Error(`server returned ${statuscode} - ${res.statusText}`)
      }
      return res.data as GetServerStatusResponse
    } catch (error) {
      throw error
    }
  }

  /**
   * Shuts down the game server. The hypervisor will send a termination signal to the server shortly after.
   */
  async shutdown() {
    try {
      let statuscode = 0
      const res = await axios.post(this.url + '/api/server/shutdown')
      status = res.data
      statuscode = res.status
      if (statuscode > 299 && statuscode < 500) {
        throw new Error(`server returned ${statuscode} - ${res.statusText}`)
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Activates a player slip, returns information about the player
   * @param playerToken The token provided by the player during connection
   */
  async activateSlip(playerToken: string) {
    try {
      let statuscode = 0
      const res = await axios.post(this.url + '/api/player/activate', {}, {
        headers: {
          'Authorization': `Bearer ${playerToken}`
        }
      })
      statuscode = res.status
      if (statuscode > 299 && statuscode < 500) {
        throw new Error(`server returned ${statuscode} - ${res.statusText}`)
      }

      // Launch heartbeat interval
      this.heartbeatIndex[playerToken] = setTimeout(() => {
        this.heartbeatSlip(playerToken)
      }, 10000);

      return res.data as ActivateSlipResponse
    } catch (error) {
      throw error
    }
  }

  /**
   * Heartbeats a player's slip
   * @param playerToken The player's token
   */
  private async heartbeatSlip(playerToken: string) {
    try {
      let statuscode = 0
      const res = await axios.post(this.url + '/api/player/heartbeat', {}, {
        headers: {
          'Authorization': `Bearer ${playerToken}`
        }
      })
      statuscode = res.status
      if (statuscode > 299 && statuscode < 500) {
        throw new Error(`server returned ${statuscode} - ${res.statusText}`)
      }
      return
    } catch (error) {
      throw error
    }
  }

  /**
   * Settle the player's slip without them being defeated. Used when they want to cash-out of a long-running game.
   * @param playerToken The player's token
   */
  async settleSlip(playerToken: string) {
    try {
      let statuscode = 0
      const res = await axios.post(this.url + '/api/player/settle', {}, {
        headers: {
          'Authorization': `Bearer ${playerToken}`
        }
      })
      statuscode = res.status
      if (statuscode > 299 && statuscode < 500) {
        throw new Error(`server returned ${statuscode} - ${res.statusText}`)
      }

      // Remove slip heartbeat
      if (this.heartbeatIndex[playerToken]) {
        clearTimeout(this.heartbeatIndex[playerToken])
      }

      return
    } catch (error) {
      throw error
    }
  }

  /**
   * Close player session and report score. This should only be used for Leaderboard games (where it's the only call that should be used to close the session)
   * @param playerToken The player's token
   * @param scoreReport The player's score
   */
  async reportPlayerScore(playerToken: string, scoreReport: ScoreReport) {
    try {
      let statuscode = 0
      const res = await axios.post(this.url + '/api/player/report-score', scoreReport, {
        headers: {
          'Authorization': `Bearer ${playerToken}`
        }
      })
      statuscode = res.status
      if (statuscode > 299 && statuscode < 500) {
        throw new Error(`server returned ${statuscode} - ${res.statusText}`)
      }

      return
    } catch (error) {
      throw error
    }
  }

  /**
   * Close player session as they lost against someone
   * @param defeatedPlayerToken The defeated player's token
   * @param winningPlayerToken The winning player's token
   */
  async playerDefeated(defeatedPlayerToken: string, winningPlayerToken: string) {
    try {
      let statuscode = 0
      const res = await axios.post(this.url + '/api/player/defeat', {
        winner_token: winningPlayerToken
      }, {
        headers: {
          'Authorization': `Bearer ${defeatedPlayerToken}`
        }
      })
      statuscode = res.status
      if (statuscode > 299 && statuscode < 500) {
        throw new Error(`server returned ${statuscode} - ${res.statusText}`)
      }

      // Remove slip heartbeat
      if (this.heartbeatIndex[defeatedPlayerToken]) {
        clearTimeout(this.heartbeatIndex[defeatedPlayerToken])
      }

      return
    } catch (error) {
      throw error
    }
  }

  /**
   * Close player session as they lost against the environment (ex: ran into a wall). They will lose some of their tokens.
   * @param defeatedPlayerToken The defeated player's token
   */
  async playerSelfDefeat(defeatedPlayerToken: string) {
    try {
      let statuscode = 0
      const res = await axios.post(this.url + '/api/player/self-defeat', {}, {
        headers: {
          'Authorization': `Bearer ${defeatedPlayerToken}`
        }
      })
      statuscode = res.status
      if (statuscode > 299 && statuscode < 500) {
        throw new Error(`server returned ${statuscode} - ${res.statusText}`)
      }

      // Remove slip heartbeat
      if (this.heartbeatIndex[defeatedPlayerToken]) {
        clearTimeout(this.heartbeatIndex[defeatedPlayerToken])
      }

      return
    } catch (error) {
      throw error
    }
  }

  /**
   * Close player session as they lost against the environment (ex: ran into a wall). They will lose some of their tokens.
   */
  private async heartbeatPool() {
    try {
      let statuscode = 0
      const res = await axios.post(this.url + '/api/pool/heartbeat', {
      })
      statuscode = res.status
      if (statuscode > 299 && statuscode < 500) {
        throw new Error(`server returned ${statuscode} - ${res.statusText}`)
      }
      return
    } catch (error) {
      throw error
    }
  }

  /**
   * Starts a background worker that will heartbeat the pool. The worker will automatically be stopped when a pool is settled. It will also immediately send an initial heartbeat.
   */
  startPoolHeartbeatLoop() {
    this.heartbeatPool()
    this.poolHeartbeat = setInterval(() => {
      this.heartbeatPool()
    }, 10000)
  }

  /**
   * Locks a pool so that no more players can join, and any player that disconnects loses.
   */
  async lockPool() {
    try {
      let statuscode = 0
      const res = await axios.post(this.url + '/api/pool/lock', {
      })
      statuscode = res.status
      if (statuscode > 299 && statuscode < 500) {
        throw new Error(`server returned ${statuscode} - ${res.statusText}`)
      }
      return
    } catch (error) {
      throw error
    }
  }

  /**
   * Returns a pool when no winner can be determined. All remaining players will have the pool tokens evenly distributed. Players that have already lose will not get their tokens returned.
   * @param reason The reason that the pool was returned. For example 'players tied'
   */
  async returnPool( reason: string) {
    try {
      let statuscode = 0
      const res = await axios.post(this.url + '/api/pool/return', {
        reason
      })
      statuscode = res.status
      if (statuscode > 299 && statuscode < 500) {
        throw new Error(`server returned ${statuscode} - ${res.statusText}`)
      }

      // Stop the pool heartbeat
      if (this.poolHeartbeat) {
        clearTimeout(this.poolHeartbeat)
      }
      return
    } catch (error) {
      throw error
    }
  }

  /**
   * Settles a pool with a winning player. This player will get all of the tokens within the pool. All other players must have had `defeatPlayer()` called on them, otherwise this call will fail.
   * @param playerToken The token of the winning player
   */
  async settlePool(playerToken: string) {
    try {
      let statuscode = 0
      const res = await axios.post(this.url + '/api/pool/settle', {
      }, {
        headers: {
          'Authorization': `Bearer ${playerToken}`
        }
      })
      statuscode = res.status
      if (statuscode > 299 && statuscode < 500) {
        throw new Error(`server returned ${statuscode} - ${res.statusText}`)
      }

      // Stop the pool heartbeat
      if (this.poolHeartbeat) {
        clearTimeout(this.poolHeartbeat)
      }
      return
    } catch (error) {
      throw error
    }
  }

}
