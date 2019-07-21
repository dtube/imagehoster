/** Get Tribe token icon. */
var SSC = require('sscjs');
var ssc = new SSC('https://api.steem-engine.com/rpc');
import {logger} from './logger'
import * as config from 'config'
import { base58Enc } from './utils'

import {KoaContext} from './common'
import {APIError} from './error'

import * as request from "request-promise-native";

const DefaultTribe = config.get('default_tribe') as string
const TribeSizes: {[size: string]: number} = {
  small: 64,
  medium: 128,
  large: 512,
}

export async function tribeHandler(ctx: KoaContext) {
  ctx.tag({handler: 'tribe'})

  APIError.assert(ctx.method === 'GET', APIError.Code.InvalidMethod)
  APIError.assertParams(ctx.params, ['tribename'])

  const tribename = ctx.params['tribename']
  const size = TribeSizes[ctx.params['size']] || TribeSizes.medium

  let tribeData: any = await ssc.find('tokens','tokens', {symbol: tribename}, 1000, 0, [], (err:string, results:any) => {
    if (err) throw err;
  });

  let tribeUrl:string = JSON.parse(tribeData[0].metadata).icon

  APIError.assert(tribeUrl, APIError.Code.NoSuchAccount)

  ctx.set('Cache-Control', 'public,max-age=600')
  ctx.redirect(`/p/${ base58Enc(tribeUrl) }?width=${ size }&height=${ size }`)
}
