import Collection from 'collection/collection'
import HighlightedUser from 'component/quick_search/model/highlighted_user'

const Users = Collection.extend({
    model: HighlightedUser,
})

export default Users
