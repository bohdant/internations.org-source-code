import BaseSearchResultsView from 'component/quick_search/view/base_search_results'
import UserSearchResultView from 'component/quick_search/view/user_search_result'

const UserSearchResultsView = BaseSearchResultsView.extend({
    ItemView: UserSearchResultView,
})

export default UserSearchResultsView
