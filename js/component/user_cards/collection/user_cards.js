import Collection from 'collection/collection'
import UserCardModel from 'component/user_cards/model/user_card'

const UserCardsCollection = Collection.extend({
    model: UserCardModel,
})

export default UserCardsCollection
