/**
 * Teaser entry model.
 *
 * Contains user, permissions, description
 */

import Model from 'model/model'
import UserModel from 'model/user'
import cut from 'service/string/cut'

const UserEntryModel = Model.extend({
    /**
     * Fields:
     * - user: Object - user fields for instantiation user
     * - upgradeTrigger: String - upgrade trigger name (used for upgrade tracking if set)
     * - upgradeLink: String - where to redirect to after the upgrade
     * - canRequestContact: Boolean - contact request sending permissions
     * - canConfirmContact: Boolean - contact confirmation permissions
     * - canSendPrivateMessage: Boolean - private message premissions
     * - description: String|null - short teaser description, e.g.
     *                              "Shares 26 contacts, 5 interests" for Member Recommendations
     *                              or "via About InterNations" for Profile Visitors
     */

    /**
     * User getter. Should always be used to obtain user related data
     */
    getUser() {
        // was already instantiated
        if (this._user) {
            return this._user
        }

        this._user = new UserModel(this.get('user'))

        return this._user
    },

    toJSON(...args) {
        const json = Model.prototype.toJSON.apply(this, args)

        // user is a model
        json.user = this.getUser().toJSON()

        json.descriptionShort = json.description ? cut(json.description, 60) : ''

        return json
    },
})

export default UserEntryModel
