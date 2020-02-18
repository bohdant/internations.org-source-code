import View from 'view/view'
import Router from 'service/router'
import template from 'component/quick_search/template/user_search_result.tmpl'

const UserSearchResultView = View.extend({
    tagName: 'li',
    className: 'js-navigation-item headerFlyoutList__item',
    template,

    events: {
        // handle selection from key navigation
        'navigation:select': 'select',
    },

    select() {
        this.trigger('UserSearchResult:select', { user: this.model })
    },

    render() {
        this.$el.html(
            this.template({
                user: this.model.toJSON(),
                link: {
                    profile: Router.path(
                        'profile_profile_get',
                        { userId: this.model.get('id') },
                        {
                            query: { ref: 'he_pi' },
                        }
                    ),
                },
            })
        )

        return this
    },
})

export default UserSearchResultView
