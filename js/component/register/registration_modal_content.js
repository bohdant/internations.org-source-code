import Router from 'service/router'
import { getDesignVariant } from 'component/register/registration_form_content'
import template from 'component/register/template/registration_modal.tmpl'

export function shouldUseUrl(registrationTrigger) {
    return !getDesignVariant(registrationTrigger)
}

export function getUrl(registrationTrigger) {
    const query = registrationTrigger ? { trigger: registrationTrigger } : null
    return Router.path('registration_power_layer_new', null, { query })
}

export function renderHtml() {
    return template()
}
