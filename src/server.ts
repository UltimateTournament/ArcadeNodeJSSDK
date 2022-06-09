import { dLog } from './logging'
import axios from 'axios'
import { GetServerStatusResponse, HeartbeatIndex, ScoreReport } from './types'

const PlayerIDProp = "pid"
const SlipIDProp = "sid"

export default class ArcadeServerSDK {

  // TODO: Update to correct port
  url = "http://localhost:8080"
  debug = process.env['ARCADE_DEBUG'] === '1' // debug logging
  playerToken = "" // get from connecting player
  heartbeatIndex: HeartbeatIndex = {}
  poolHeartbeat?: NodeJS.Timer

  constructor() {
    dLog("starting arcade server sdk")
  }

  async getServerStatus(): Promise<GetServerStatusResponse> {
    try {
      let statuscode = 0
      let retryCount = 0
      let status: GetServerStatusResponse | null = null
      while (statuscode !== 200) {
        if (retryCount > 0) {
          await new Promise((r) => {
            setTimeout(() => {
              r(null)
            }, 200 * retryCount)
          })
        }
        const res = await axios.get(this.url+'/api/server')
        status = res.data
        statuscode = res.status
        if (statuscode > 299 && statuscode < 500) {
          throw new Error(`server returned ${statuscode} - ${res.statusText}`)
        }

        retryCount++
        if (retryCount >= 5) {
          throw new Error(`max retries hit, exiting with status code ${statuscode}`)
        }
      }
      return status as GetServerStatusResponse
    } catch (error) {
      throw error
    }
  }

  /**
   * Shuts down the game server. The hypervisor will send a termination signal to the server shortly after.
   */
  async shutdown()  {
    try {
      let statuscode = 0
      let retryCount = 0
      let status: GetServerStatusResponse | null = null
      while (statuscode !== 200) {
        if (retryCount > 0) {
          await new Promise((r) => {
            setTimeout(() => {
              r(null)
            }, 200 * retryCount)
          })
        }
        const res = await axios.post(this.url+'/api/server/shutdown')
        status = res.data
        statuscode = res.status
        if (statuscode > 299 && statuscode < 500) {
          throw new Error(`server returned ${statuscode} - ${res.statusText}`)
        }

        retryCount++
        if (retryCount >= 5) {
          throw new Error(`max retries hit, exiting with status code ${statuscode}`)
        }
      }
      return status as GetServerStatusResponse
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
      let retryCount = 0
      let status: GetServerStatusResponse | null = null
      while (statuscode !== 200) {
        if (retryCount > 0) {
          await new Promise((r) => {
            setTimeout(() => {
              r(null)
            }, 200 * retryCount)
          })
        }
        const res = await axios.post(this.url+'/api/player/activate', {}, {
          headers: {
            'Authorization': `Bearer ${playerToken}`
          }
        })
        status = res.data
        statuscode = res.status
        if (statuscode > 299 && statuscode < 500) {
          throw new Error(`server returned ${statuscode} - ${res.statusText}`)
        }

        retryCount++
        if (retryCount >= 5) {
          throw new Error(`max retries hit, exiting with status code ${statuscode}`)
        }
      }

      // Launch heartbeat interval
      this.heartbeatIndex[playerToken] = setTimeout(() => {
        this.heartbeatSlip(playerToken)
      }, 10000);

      return status as GetServerStatusResponse
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
      let retryCount = 0
      let status: GetServerStatusResponse | null = null
      while (statuscode !== 200) {
        if (retryCount > 0) {
          await new Promise((r) => {
            setTimeout(() => {
              r(null)
            }, 200 * retryCount)
          })
        }
        const res = await axios.post(this.url+'/api/player/heartbeat', {}, {
          headers: {
            'Authorization': `Bearer ${playerToken}`
          }
        })
        status = res.data
        statuscode = res.status
        if (statuscode > 299 && statuscode < 500) {
          throw new Error(`server returned ${statuscode} - ${res.statusText}`)
        }

        retryCount++
        if (retryCount >= 5) {
          throw new Error(`max retries hit, exiting with status code ${statuscode}`)
        }
      }
      return status as GetServerStatusResponse
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
      let retryCount = 0
      let status: GetServerStatusResponse | null = null
      while (statuscode !== 200) {
        if (retryCount > 0) {
          await new Promise((r) => {
            setTimeout(() => {
              r(null)
            }, 200 * retryCount)
          })
        }
        const res = await axios.post(this.url+'/api/player/settle', {}, {
          headers: {
            'Authorization': `Bearer ${playerToken}`
          }
        })
        status = res.data
        statuscode = res.status
        if (statuscode > 299 && statuscode < 500) {
          throw new Error(`server returned ${statuscode} - ${res.statusText}`)
        }

        retryCount++
        if (retryCount >= 5) {
          throw new Error(`max retries hit, exiting with status code ${statuscode}`)
        }
      }

      // Remove slip heartbeat
      if (this.heartbeatIndex[playerToken]) {
        clearTimeout(this.heartbeatIndex[playerToken])
      }

      return status as GetServerStatusResponse
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
      let retryCount = 0
      let status: GetServerStatusResponse | null = null
      while (statuscode !== 200) {
        if (retryCount > 0) {
          await new Promise((r) => {
            setTimeout(() => {
              r(null)
            }, 200 * retryCount)
          })
        }
        const res = await axios.post(this.url+'/api/player/report-score', scoreReport, {
          headers: {
            'Authorization': `Bearer ${playerToken}`
          }
        })
        status = res.data
        statuscode = res.status
        if (statuscode > 299 && statuscode < 500) {
          throw new Error(`server returned ${statuscode} - ${res.statusText}`)
        }

        retryCount++
        if (retryCount >= 5) {
          throw new Error(`max retries hit, exiting with status code ${statuscode}`)
        }
      }

      // Remove slip heartbeat
      if (this.heartbeatIndex[playerToken]) {
        clearTimeout(this.heartbeatIndex[playerToken])
      }

      return status as GetServerStatusResponse
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
      let retryCount = 0
      let status: GetServerStatusResponse | null = null
      while (statuscode !== 200) {
        if (retryCount > 0) {
          await new Promise((r) => {
            setTimeout(() => {
              r(null)
            }, 200 * retryCount)
          })
        }
        const res = await axios.post(this.url+'/api/player/defeat', {
          winner_token: winningPlayerToken
        }, {
          headers: {
            'Authorization': `Bearer ${defeatedPlayerToken}`
          }
        })
        status = res.data
        statuscode = res.status
        if (statuscode > 299 && statuscode < 500) {
          throw new Error(`server returned ${statuscode} - ${res.statusText}`)
        }

        retryCount++
        if (retryCount >= 5) {
          throw new Error(`max retries hit, exiting with status code ${statuscode}`)
        }
      }

      // Remove slip heartbeat
      if (this.heartbeatIndex[defeatedPlayerToken]) {
        clearTimeout(this.heartbeatIndex[defeatedPlayerToken])
      }

      return status as GetServerStatusResponse
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
      let retryCount = 0
      let status: GetServerStatusResponse | null = null
      while (statuscode !== 200) {
        if (retryCount > 0) {
          await new Promise((r) => {
            setTimeout(() => {
              r(null)
            }, 200 * retryCount)
          })
        }
        const res = await axios.post(this.url+'/api/player/self-defeat', {}, {
          headers: {
            'Authorization': `Bearer ${defeatedPlayerToken}`
          }
        })
        status = res.data
        statuscode = res.status
        if (statuscode > 299 && statuscode < 500) {
          throw new Error(`server returned ${statuscode} - ${res.statusText}`)
        }

        retryCount++
        if (retryCount >= 5) {
          throw new Error(`max retries hit, exiting with status code ${statuscode}`)
        }
      }

      // Remove slip heartbeat
      if (this.heartbeatIndex[defeatedPlayerToken]) {
        clearTimeout(this.heartbeatIndex[defeatedPlayerToken])
      }

      return status as GetServerStatusResponse
    } catch (error) {
      throw error
    }
  }

  /**
   * Close player session as they lost against the environment (ex: ran into a wall). They will lose some of their tokens.
   */
  private async heartbeatPool(poolID: string) {
    try {
      let statuscode = 0
      let retryCount = 0
      let status: GetServerStatusResponse | null = null
      while (statuscode !== 200) {
        if (retryCount > 0) {
          await new Promise((r) => {
            setTimeout(() => {
              r(null)
            }, 200 * retryCount)
          })
        }
        const res = await axios.post(this.url+'/api/pool/heartbeat', {
          pool_id: poolID
        })
        status = res.data
        statuscode = res.status
        if (statuscode > 299 && statuscode < 500) {
          throw new Error(`server returned ${statuscode} - ${res.statusText}`)
        }

        retryCount++
        if (retryCount >= 5) {
          throw new Error(`max retries hit, exiting with status code ${statuscode}`)
        }
      }
      return status as GetServerStatusResponse
    } catch (error) {
      throw error
    }
  }

  /**
   * Starts a background worker that will heartbeat the pool. The worker will automatically be stopped when a pool is settled. It will also immediately send an initial heartbeat.
   * @param poolID The Pool ID
   */
  startPoolHeartbeatLoop(poolID: string) {
    this.heartbeatPool(poolID)
    this.poolHeartbeat = setInterval(() => {
      this.heartbeatPool(poolID)
    }, 10000)
  }

  /**
   * Locks a pool so that no more players can join, and any player that disconnects loses.
   */
  async lockPool(poolID: string) {
    try {
      let statuscode = 0
      let retryCount = 0
      let status: GetServerStatusResponse | null = null
      while (statuscode !== 200) {
        if (retryCount > 0) {
          await new Promise((r) => {
            setTimeout(() => {
              r(null)
            }, 200 * retryCount)
          })
        }
        const res = await axios.post(this.url+'/api/pool/lock', {
          pool_id: poolID
        })
        status = res.data
        statuscode = res.status
        if (statuscode > 299 && statuscode < 500) {
          throw new Error(`server returned ${statuscode} - ${res.statusText}`)
        }

        retryCount++
        if (retryCount >= 5) {
          throw new Error(`max retries hit, exiting with status code ${statuscode}`)
        }
      }
      return status as GetServerStatusResponse
    } catch (error) {
      throw error
    }
  }

  /**
   * Returns a pool when no winner can be determined. All remaining players will have the pool tokens evenly distributed. Players that have already lose will not get their tokens returned.
   * @param poolID The Pool ID
   * @param reason The reason that the pool was returned. For example 'players tied'
   */
  async returnPool(poolID: string, reason: string) {
    try {
      let statuscode = 0
      let retryCount = 0
      let status: GetServerStatusResponse | null = null
      while (statuscode !== 200) {
        if (retryCount > 0) {
          await new Promise((r) => {
            setTimeout(() => {
              r(null)
            }, 200 * retryCount)
          })
        }
        const res = await axios.post(this.url+'/api/pool/return', {
          pool_id: poolID,
          reason
        })
        status = res.data
        statuscode = res.status
        if (statuscode > 299 && statuscode < 500) {
          throw new Error(`server returned ${statuscode} - ${res.statusText}`)
        }

        retryCount++
        if (retryCount >= 5) {
          throw new Error(`max retries hit, exiting with status code ${statuscode}`)
        }
      }

      // Stop the pool heartbeat
      if (this.poolHeartbeat) {
        clearTimeout(this.poolHeartbeat)
      }
      return status as GetServerStatusResponse
    } catch (error) {
      throw error
    }
  }

  /**
   * Settles a pool with a winning player. This player will get all of the tokens within the pool. All other players must have had `defeatPlayer()` called on them, otherwise this call will fail.
   * @param playerToken The token of the winning player
   * @param poolID The Pool ID
   */
  async settlePool(playerToken: string, poolID: string) {
    try {
      let statuscode = 0
      let retryCount = 0
      let status: GetServerStatusResponse | null = null
      while (statuscode !== 200) {
        if (retryCount > 0) {
          await new Promise((r) => {
            setTimeout(() => {
              r(null)
            }, 200 * retryCount)
          })
        }
        const res = await axios.post(this.url+'/api/pool/settle', {
          pool_id: poolID
        }, {
          headers: {
            'Authorization': `Bearer ${playerToken}`
          }
        })
        status = res.data
        statuscode = res.status
        if (statuscode > 299 && statuscode < 500) {
          throw new Error(`server returned ${statuscode} - ${res.statusText}`)
        }

        retryCount++
        if (retryCount >= 5) {
          throw new Error(`max retries hit, exiting with status code ${statuscode}`)
        }
      }

      // Stop the pool heartbeat
      if (this.poolHeartbeat) {
        clearTimeout(this.poolHeartbeat)
      }
      return status as GetServerStatusResponse
    } catch (error) {
      throw error
    }
  }

}
