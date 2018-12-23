/** Serve user avatars. */

import * as config from 'config'
import { base58Enc } from './utils'

import {KoaContext} from './common'
import {APIError} from './error'

import * as request from "request-promise-native";

const DefaultAvatar = config.get('default_avatar') as string
const AvatarSizes: {[size: string]: number} = {
    small: 64,
    medium: 128,
    large: 512,
}

export async function avatarHandler(ctx: KoaContext) {
    ctx.tag({handler: 'avatar'})

    APIError.assert(ctx.method === 'GET', APIError.Code.InvalidMethod)
    APIError.assertParams(ctx.params, ['username'])

    const username = ctx.params['username']
    const size = AvatarSizes[ctx.params['size']] || AvatarSizes.medium
 
    const result = await request.get({uri: config.get('rpc_node')+'/accounts/'+username});

    let account: any
    try {
        account = JSON.parse(result)[0]
    } catch (error) {
        ctx.log.debug(error, 'unable to parse json')
    }

    APIError.assert(account, APIError.Code.NoSuchAccount)

    let avatarUrl: string = DefaultAvatar
    if (account && account.json && account.json.profile &&
        account.json.profile.avatar &&
        account.json.profile.avatar.match(/^https?:\/\//)) {
        avatarUrl = account.json.profile.avatar
    }

    console.log(avatarUrl)

    ctx.set('Cache-Control', 'public,max-age=600')
    ctx.redirect(`/p/${ base58Enc(avatarUrl) }?width=${ size }&height=${ size }`)
}
