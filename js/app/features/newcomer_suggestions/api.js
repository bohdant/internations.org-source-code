/* @flow */
import normalize, { schemas } from 'app/api/schema'
import io from 'service/io'
import Router from 'service/router'

export const fetchNewcomersSuggestions = ({ limit = 3, offset = 0 }: { limit: number, offset: number } = {}) => {
    const url = Router.path('user_api_newcomer_contact_suggestions_get')
    const data = { limit, offset }

    return io
        .ajax({ url, dataType: 'json', data })
        .then(response => normalize({ data: response, schema: schemas.users }))
}

export const sendContactRequest = ({ userId, message }: { userId: number, message?: string }) => {
    const url = Router.path('network_api_contact_request_post')
    const data = { userId, message }
    return io.ajax({ url, data, dataType: 'json', type: 'POST' })
}
