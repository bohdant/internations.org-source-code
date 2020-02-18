import BaseSearchResultsView from 'component/quick_search/view/base_search_results'
import TwinkleListItemView from 'component/header/view/twinkle_list_item'

const TwinkleListView = BaseSearchResultsView.extend({
    ItemView: TwinkleListItemView,
})

export default TwinkleListView
