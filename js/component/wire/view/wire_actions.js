/**
 * Wire actions
 */

import $ from 'jquery'
import _ from 'lodash'
import View from 'view/view'
import DeleteEntryModalView from 'view/delete_entry_modal'

const WireActionsView = View.extend({
    events: {
        'click .js-delete-wire-entry-trigger': 'onDeleteEntry',
    },

    initialize() {
        _.bindAll(this, _.functionsIn(this))
    },

    onDeleteEntry(e) {
        const $target = $(e.target)
        const formAction = $target.attr('data-form-action')
        const $deleteEntryForm = $('.js-delete-wire-entry-form')

        // Modify form action url if trigger contains data-form-action
        if (formAction) {
            $deleteEntryForm.attr('action', formAction)
        }

        new DeleteEntryModalView({
            el: $deleteEntryForm,
            target: $target.closest('.js-wire-item'),
        })

        return false
    },
})

export default WireActionsView
