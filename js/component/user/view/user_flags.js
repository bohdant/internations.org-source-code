/**
 * User flags component.
 *
 * Shows flag of countries user is originally from / currently living in
 *
 * model: UserModel
 */

import View from 'view/view'
import template from 'component/user/template/user_flags.tmpl'

export default View.extend({
    template,

    render() {
        this.$el.html(this.template({ user: this.model.toJSON() }))

        return this
    },
})
