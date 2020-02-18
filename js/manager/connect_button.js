import Manager from 'manager/base'
import ConnectButtonView from 'component/connect_button/connect_button'

const ConnectButtonManager = Manager.extend({
    options: {
        selector: '.js-managed-connect-button',
    },

    initializeElements($elements) {
        $elements.each(function() {
            new ConnectButtonView({
                el: this,
            })
        })
    },
})

export default ConnectButtonManager
