/**
 * User name view
 *
 * Used for showing user names linking to their profiles including user cards.
 *
 * @options
 * - model: UserModel
 * - [disableLink=false]: Boolean - show the name as text but not link
 * - [cssClass]: String - additional class
 * - [usernameLinkRef]: String - user name profile link tracking
 * - [hyphenateUsername=false]: Boolean - wrap long user names to the next line if needed
 * - [truncateUsername=0]: Number - amount of characters to truncate to. 0 - do not truncate
 */

import View from 'view/view'
import Router from 'service/router'
import cut from 'service/string/cut'
import trimAll from 'service/string/trimAll'

import currentUserModel from 'shared/model/current_user'

import template from 'component/user/template/user_name.tmpl'

export default View.extend({
    template,

    _disableLink: false,
    _userCard: true,

    defaultOptions: {
        disableLink: false,
        cssClass: '',
        usernameLinkRef: '',
        hyphenateUsername: false,
        truncateUsername: 0,
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
        this._disableLink = this.options.disableLink

        if (!this.model.hasUserInfo()) {
            this._disableLink = true
            this._userCard = false

            return
        }

        // Don't show user card for current user
        this._userCard = this.model.get('id') !== currentUserModel.get('id')
    },

    render() {
        this.destroySubviews()

        const domClass = ['userName']
        const userJSON = this.model.toJSON()

        if (this._userCard) {
            domClass.push('js-user-card')
        }

        if (this.options.cssClass) {
            domClass.push(this.options.cssClass)
        }

        if (this.options.hyphenateUsername) {
            domClass.push('u-wordWrap')
        }

        if (this.options.truncateUsername) {
            userJSON.fullName = cut(userJSON.fullName, this.options.truncateUsername)
        }

        const template = trimAll(
            this.template({
                user: userJSON,
                domClass: domClass.join(' '),
                disableLink: this._disableLink,
                userCard: this._userCard,
                hyphenateUsername: this.options.hyphenateUsername,
                link: {
                    username: Router.path(
                        'profile_profile_get',
                        { userId: this.model.get('id') },
                        { query: { ref: this.options.usernameLinkRef } }
                    ),
                    userCard: this._userCard ? Router.path('profile_preview_get', { id: this.model.get('id') }) : '',
                },
            })
        )

        this.$el.html(template)

        return this
    },
})
