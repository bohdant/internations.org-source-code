/**
 * Counter component with badge template
 */

import CounterView from 'component/counter/counter'
import template from 'component/counter/template/badge.tmpl'

const CounterBadgeView = CounterView.extend({
    template,
})

export default CounterBadgeView
