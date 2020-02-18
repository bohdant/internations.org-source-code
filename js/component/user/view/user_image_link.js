/**
 * User link image component
 *
 * Used for showing linked small and micro user images with user cards and membership icons.
 *
 * @options
 * - model: UserModel
 * - size: String - large, medium, small, xsmall
 * - [disableLink=false]: Boolean - show the user image unlinked
 * - [imageLinkRef]: String - image profile link tracking
 * - [registrationTrigger]: String - registration trigger tracking
 * - [isLoggedIn=currentUserModel.isLoggedIn()]: Boolean - use to override the state of currentUserModel.isLoggedIn()
 */

import Router from 'service/router'
import View from 'view/view'

import UserImageView from 'component/user/view/user_image'
import MembershipIconView from 'component/user/view/membership_icon'

import currentUserModel from 'shared/model/current_user'

import template from 'component/user/template/user_image_link.tmpl'

export default View.extend({
    template,

    _disableLink: false,
    _userCard: true,
    _triggerRegistrationModal: false,

    defaultOptions: {
        size: '',
        disableLink: false,
        imageLinkRef: '',
        registrationTrigger: '',
        registrationClass: 'js-registration-trigger',
        isLoggedIn: false,
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
        this._initExternalUser()

        // xsmall images don't link to profile
        this._disableLink = this.options.disableLink || this.options.size === 'xsmall'

        // Former or masked user
        if (!this.model.hasUserInfo() && this.options.isLoggedIn) {
            this._disableLink = true
            this._userCard = false
        }
    },

    // External user as "not logged in"
    _initExternalUser() {
        if (!this.options.isLoggedIn) {
            this._userCard = false
            this._triggerRegistrationModal = true
        }
    },

    render() {
        this.destroySubviews()

        // show membership icon tooltip only for "medium" and "large" sizes
        const showMembershipIcon =
            this.model.isPremium() && (this.options.size === 'large' || this.options.size === 'medium')

        // disable user card for current user
        const userCard = this._userCard && this.model.get('id') !== currentUserModel.get('id')

        const domClass = ['t-user-preview-image-link js-component-user-image userPreview__imageLink']

        if (!this._disableLink && userCard) {
            domClass.push('t-user-image-card js-user-card')
        }

        if (!this._disableLink && this._triggerRegistrationModal) {
            domClass.push(this.options.registrationClass)
        }

        this.$el.html(
            this.template({
                domClass: domClass.join(' '),
                disableLink: this._disableLink,
                registrationTrigger: this.options.registrationTrigger,
                showMembershipIcon,
                userCard,
                link: {
                    image: this._triggerRegistrationModal
                        ? Router.path('registration_basic_registration_edit')
                        : Router.path(
                              'profile_profile_get',
                              { userId: this.model.get('id') },
                              { query: { ref: this.options.imageLinkRef } }
                          ),
                    userCard: this._userCard ? Router.path('profile_preview_get', { id: this.model.get('id') }) : '',
                },
            })
        )

        this.initSubview(UserImageView, {
            el: this.$('.js-component-user-image'),
            model: this.model,
            size: this.options.size,
        }).render()

        if (showMembershipIcon) {
            this.initSubview(MembershipIconView, {
                el: this.$('.js-component-membershipIcon'),
                model: this.model,
            }).render()
        }

        return this
    },
})
