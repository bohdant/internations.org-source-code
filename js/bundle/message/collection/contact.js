import _ from 'lodash'
import Collection from 'collection/collection'
import Model from 'model/model'
import io from 'service/io'
import Router from 'service/router'

const UserModel = Model.extend({
    defaults: {
        id: 0,
        name: '',
        iconUrl: '',
        gender: '',
    },
})

const ContactCollection = Collection.extend({
    // Reference to this collection's model.
    model: UserModel,

    initialize(models, options) {
        Collection.prototype.initialize.call(this, models, options)
    },

    _onCreateUserModels(rowAttr) {
        let iconUrl = ''
        if (rowAttr.i !== null) {
            iconUrl = `${this.imageServer}/${rowAttr.i}`
        } else {
            iconUrl = this.placeholder[rowAttr.g]
        }

        return new UserModel({
            id: rowAttr.id,
            name: rowAttr.n,
            iconUrl,
            gender: rowAttr.g,
        })
    },

    requestContacts(callback) {
        if (this.models.length > 0) {
            callback(this.toJSON())
            return
        }

        io.get(
            Router.path('network_contact_index'),
            response => {
                // fake response
                response.success = true

                let models = []
                const info = {
                    imageServer: response.imageServer,
                    placeholder: response.placeholder,
                }

                if (response.success && response.contacts.length > 0) {
                    models = _.map(response.contacts, this._onCreateUserModels.bind(info))
                }

                this.reset(models)
                callback(this.toJSON())
            },
            'json'
        )
    },
})

export default ContactCollection
