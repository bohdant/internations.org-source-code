import View from 'view/view'
import CarouselView from 'view/carousel'

import $ from 'jquery'
import React from 'react'
import ReactDOM from 'react-dom'
import ProductTable from 'app/components/layout/ProductTable'

export default View.extend({
    render() {
        const newVisualsFreeTrial = !!this.$('.js-albatross-benefits-free-trial').length

        const carousel = this.initSubview(CarouselView, {
            el: this.$('.js-paywall-carousel'),
            dots: true,
            insetDots: !newVisualsFreeTrial,
            arrows: false,
            infinite: true,
            autoplay: true,
            autoplaySpeed: 10000,
            pauseOnHover: false,
        })

        if (newVisualsFreeTrial) {
            const ANIMATION_OFFSET = 100

            carousel.on('Carousel:browse', ({ nextSlideIndex, currentSlideIndex }) => {
                // poor man's parallax - nudge the background in the direction of the slide scroll. Animated with
                // a CSS transition.
                this.$('.js-albatross-benefits-free-trial').css(
                    'background-position-x',
                    `${nextSlideIndex > currentSlideIndex ? '-' : '+'}=${ANIMATION_OFFSET}`
                )
            })
        }

        // @todo INPREMIUM-1115 unify the implementation of the product table
        if ($('.js-productTable').length) {
            const productInputFields = $('.productSelection__input').toArray()
            const fieldName = $('.productSelection__input')[0].dataset.name
            const productList = productInputFields.map(product => ({
                price: product.dataset.price,
                timePeriod: product.dataset.timeperiod,
                preselected: product.dataset.preselected,
                value: product.dataset.value,
            }))

            let selectedProduct = null

            productList.forEach(product => {
                if (product.preselected === '1') {
                    selectedProduct = product.value
                }
            })

            if (this.$('.js-productTable').length > 0) {
                ReactDOM.render(
                    <ProductTable productList={productList} fieldName={fieldName} selectedProduct={selectedProduct} />,
                    this.$('.js-productTable')[0]
                )
            }
        }

        return this
    },
})
