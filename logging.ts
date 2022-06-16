const debug = process.env['ARCADE_DEBUG'] === '1' // debug logging

/**
 * Debug Log
 */
export function dLog(...args: any) {
  if (debug) {
    console.log('ARCADE_DEBUG: ', ...args)
  }
}
