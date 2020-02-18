/**
 * User image view. Ported from user macro `image`
 * app-new/src/InterNations/Bundle/UserBundle/Resources/views/Macro/macros.html.twig
 *
 * Supposed to be used by MicroUser and SmallUser components
 *
 * model: UserModel
 *
 * @options
 * - size: String => One of the predefined sizes:
 *                   - userCard
 *                   - large
 *                   - medium
 *                   - small
 *                   - xsmall
 *
 * @example
 *
 * View.create(UserImageView, {
 *     el: '.js-user-image-wrapper',
 *     model: currentUserModel,
 *     size: 'small'
 * }).render();
 */

import View from 'view/view'

import template from 'component/user/template/user_image.tmpl'

const AVAILABLE_SIZES = {
    userCard: '150_150',
    large: '110_110',
    medium: '60_60',
    small: '45_45',
    xsmall: '32_32',
}

export default View.extend({
    template,

    defaultOptions: {
        size: '',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)

        if (!this.options.size) {
            throw new Error('`size` option is required for the UserImage component.')
        }
    },

    render() {
        const format = AVAILABLE_SIZES[this.options.size]
        const dimensions = format.split('_')
        const width = Number(dimensions[0])
        const height = Number(dimensions[1])

        this.$el.html(
            this.template({
                hasPhoto: this.model.hasPhoto(),
                attrs: {
                    src: this.model.getPhotoUrl({ format: `${format}-2x` }),
                    width,
                    height,
                    alt: this.model.toJSON().fullName,
                },
            })
        )

        return this
    },
})
