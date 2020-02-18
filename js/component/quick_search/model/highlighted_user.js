/**
 * User model with highlighted fields (used for search)
 *
 * It handles company/name highlights and strips scripts inside them
 */

import User from 'model/user'

const HighlightedUser = User.extend(
    {
        toJSON(...args) {
            const json = User.prototype.toJSON.apply(this, args)

            if (!json.companyHighlight) {
                json.companyHighlight = json.workplaceCompany
            }

            if (!json.nameHighlight) {
                json.nameHighlight = `${json.firstName} ${json.lastName}`
            }

            json.companyHighlight = HighlightedUser.stripScripts(json.companyHighlight)
            json.nameHighlight = HighlightedUser.stripScripts(json.nameHighlight)

            return json
        },
    },
    {
        stripScripts(str) {
            if (typeof str !== 'string') {
                return str
            }

            return str.replace(/<script/g, '&lt;script').replace(/<\/script/g, '&lt;/script')
        },
    }
)

export default HighlightedUser
