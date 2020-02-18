/**
 * General user model
 */

import Model from 'model/model'
import assets from 'service/assets'

const User = Model.extend(
    {
        defaults() {
            return {
                firstName: '',
                lastName: '',
                fullName: '',
                gender: 'm',

                roles: [],

                workplaceCompany: '',
                workplacePosition: '',

                imagePath: '',
            }
        },

        hasPhoto() {
            return Boolean(this.get('imagePath'))
        },

        /**
         * Get user photo or placeholder image if user does not have a photo.
         * Notice: we use {width, height} instead of {format} that is used in assets
         * because placeholders formats are different from user assets
         *
         * @param  {Object} [options]        Options
         * @param {String}  [options.format] Assets format, e.g. "60_60"
         *
         * @return {String}         Photo/placehoder url
         */
        getPhotoUrl(options) {
            if (!options || !options.format) {
                throw new Error('Photo format is required.')
            }

            // user photo
            if (this.hasPhoto()) {
                return assets.getImageUrl(this.get('imagePath'), {
                    format: options.format,
                })
            }

            // eg, m-32x32.png
            const placeholderFilename = `${this.get('gender')}-${options.format.replace('_', 'x')}.png`

            return assets.getStaticImageUrl(`/placeholder/profile/${placeholderFilename}`)
        },

        getFullName() {
            if (this.isFormerUser()) {
                return 'Former member'
            }

            return `${this.get('firstName')} ${this.get('lastName')}`
        },

        isAdmin() {
            return this.get('roles').includes(User.USER_ROLE_ADMIN)
        },

        isAlbatross() {
            return this.get('roles').includes(User.USER_ROLE_ALBATROSS)
        },

        isAmbassador() {
            return this.get('roles').includes(User.USER_ROLE_AMBASSADOR)
        },

        isConsul() {
            return this.get('roles').includes(User.USER_ROLE_ACTIVITY_GROUP_CONSUL)
        },

        isNewcomerBuddy() {
            return this.get('roles').includes(User.USER_ROLE_NEWCOMER_BUDDY)
        },

        isPremium() {
            return (
                this.isAdmin() || this.isAmbassador() || this.isConsul() || this.isAlbatross() || this.isNewcomerBuddy()
            )
        },

        isExistingUser() {
            return !this.isFormerUser()
        },

        isFormerUser() {
            return !this.get('id')
        },

        isMaskedUser() {
            return this.isExistingUser() && !this.get('firstName') && !this.get('lastName')
        },

        hasUserInfo() {
            return this.isExistingUser() && !this.isMaskedUser()
        },

        toJSON(...args) {
            const json = Model.prototype.toJSON.apply(this, args)

            json.isAdmin = this.isAdmin()
            json.isAmbassador = this.isAmbassador()
            json.isAlbatross = this.isAlbatross()
            json.isConsul = this.isConsul()
            json.isNewcomerBuddy = this.isNewcomerBuddy()
            json.isPremium = this.isPremium()
            json.isExistingUser = this.isExistingUser()
            json.isFormerUser = this.isFormerUser()
            json.isMaskedUser = this.isMaskedUser()
            json.hasUserInfo = this.hasUserInfo()
            json.fullName = this.getFullName()

            return json
        },
    },
    {
        USER_ROLE_ALBATROSS: 'ROLE_ALBATROSS',
        USER_ROLE_ADMIN: 'ROLE_ADMIN',
        USER_ROLE_AMBASSADOR: 'ROLE_AMBASSADOR',
        USER_ROLE_ACTIVITY_GROUP_CONSUL: 'ROLE_ACTIVITY_GROUP_CONSUL',
        USER_ROLE_NEWCOMER_BUDDY: 'ROLE_NEWCOMER_BUDDY',
    }
)

export default User
