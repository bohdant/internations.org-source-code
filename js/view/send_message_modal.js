import $ from 'jquery'
import Modal from 'component/modal/modal'

const SendMessageModal = Modal.extend({
    getConfig() {
        const $el = $(this.getContentElement())
        let $form

        // Some extensions, namely Grammarly (which most of CE uses), steal the context
        //     so we need to search the document for our <form>
        if ($el.length > 0 && /-extension$/.test($el[0].localName)) {
            $form = $('.js-submit-new-message, .js-conversation-submit').closest('form')
        } else {
            $form = $el.find('form')
        }

        return {
            url: $form.attr('action'),
            method: $form.attr('method'),
            token: $('#message_form__token').val(),
            conversationType: $form.data('conversation-type'),
        }
    },
})

export default SendMessageModal
