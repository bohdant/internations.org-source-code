/**
 * User info component
 *
 * Used for showing user name, workplace and flags in small user component.
 *
 * Options
 * - size: String - SmallUser size information is used for: "large" or "medium"
 * - [usernameLinkRef]: String - user name profile link tracking
 * - [hyphenateUsername=false]: Boolean - wrap long user names to the next line if needed
 * - [shortenUsername=false]: Boolean - shortens and adds ellipsis if a user name is too long
 * - [truncateUsername=0]: Number - amount of characters to truncate to. 0 - do not truncate
 */

import View from 'view/view'
import template from 'component/user/template/user_info.tmpl'

import UserNameView from 'component/user/view/user_name'
import UserFlagsView from 'component/user/view/user_flags'

export default View.extend({
    template,

    events: {},

    defaultOptions: {
        size: '',
        hyphenateUsername: false,
        shortenUsername: false,
        truncateUsername: 0,
        usernameLinkRef: '',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    render() {
        this.destroySubviews()

        const domClass = ['userPreview__userInfo']

        if (this.options.size === 'large') {
            domClass.push('userPreview__userInfo-spaceTop')
        }

        if (this.options.hyphenateUsername) {
            domClass.push('userPreview__userInfo-hyphenate')
        }

        if (this.options.shortenUsername) {
            domClass.push('userPreview__userInfo-shorten')
        }

        this.$el.html(
            this.template({
                user: this.model.toJSON(),
                domClass: domClass.join(' '),
            })
        )

        this.initSubview(UserNameView, {
            el: this.$('.js-component-user-name'),
            model: this.model,
            cssClass: 't-user-preview-name userPreview__name',
            hyphenateUsername: this.options.hyphenateUsername,
            truncateUsername: this.options.truncateUsername,
            usernameLinkRef: this.options.usernameLinkRef,
        }).render()

        // existing small user always shows flags
        if (this.model.isExistingUser()) {
            this.initSubview(UserFlagsView, {
                el: this.$('.js-component-flags'),
                model: this.model,
            }).render()
        }

        return this
    },
})
