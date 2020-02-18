import BaseSearchResultsView from 'component/quick_search/view/base_search_results'
import ConversationListItemView from 'component/header/view/conversation_list_item'

const ConversationListView = BaseSearchResultsView.extend({
    ItemView: ConversationListItemView,
})

export default ConversationListView
