/**
 * MicroUser component
 *
 * @options
 * - size: String => MicroUser size
 *                   - large
 *                   - medium
 *                   - small
 *                   - xsmall
 * - [flags=false]: Boolean - show flags below user image or not
 * - [disableLink=false]: Boolean - show the name as text but not link
 * - [imageLinkRef='']: String - profile link tracking
 * - [registrationTrigger='']: String - registration trigger tracking
 * - [isLoggedIn=currentUserModel.isLoggedIn()]: Boolean - use to override the state of currentUserModel.isLoggedIn()
 * Notice:
 * UserCards is a mess now, its not possible to instantiate it imperatively and we rely on .js-user-card class
 * with data-popover-url attribute that is handled by global UserCards View instantiated on document body.
 * [smth like manager, but without .redraw()]
 *
 * @example
 *  View.create(MicroUserView, {
 *      el: this.$('.js-micro-user-wrapper'),
 *      model: userModel,
 *      size: 'medium',
 *      imageLinkRef: '',
 *      registrationTrigger: 'masked_user'
 *  }).render();
 */

import View from 'view/view'

import UserImageLinkView from 'component/user/view/user_image_link'
import UserFlagsView from 'component/user/view/user_flags'

import template from 'component/user/template/micro_user.tmpl'

import currentUserModel from 'shared/model/current_user'

export default View.extend({
    template,

    defaultOptions() {
        return {
            size: '',
            flags: false,
            disableLink: false,
            showOverlay: false,
            isLoggedIn: currentUserModel.isLoggedIn(),
            imageLinkRef: '',
            registrationTrigger: '',
            registrationClass: 'js-registration-trigger',
        }
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    render() {
        this.destroySubviews()

        this.$el.html(
            this.template({
                size: this.options.size,
                flags: this.options.flags,
                showOverlay: this.options.showOverlay,
            })
        )

        this.initSubview(UserImageLinkView, {
            el: this.$('.js-component-user-image-link'),
            model: this.model,
            size: this.options.size,
            disableLink: this.options.disableLink,
            isLoggedIn: this.options.isLoggedIn,
            imageLinkRef: this.options.imageLinkRef,
            registrationTrigger: this.options.registrationTrigger,
            registrationClass: this.options.registrationClass,
        }).render()

        // Only show flags for existing user
        if (this.model.isExistingUser()) {
            this.initSubview(UserFlagsView, {
                el: this.$('.js-component-flags'),
                model: this.model,
            }).render()
        }

        return this
    },
})
