/**
 * Current user instance
 */

import UserModel from 'model/user'
import dataProvider from 'service/data_provider'

const CurrentUserModel = UserModel.extend({
    // detect is user logged in or not
    isLoggedIn() {
        // we do not have a user with ID = 0
        return Boolean(this.get('id')) && Boolean(this.get('registeredOn'))
    },
})

export default new CurrentUserModel(dataProvider.get('currentUser'))
