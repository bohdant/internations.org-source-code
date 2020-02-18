/**
 * Options:
 *   alt: String - alt text for the image
 *   sources: Array
 *   [title=""]: String - title text for the image
 *   [imageScale=false]: Boolean: force stretching the image instead of keeping the aspect ratio
 *
 *  @example
 *
 *  this.initSubview(ResponsiveImageView, {
 *    el: this.$('.js-responsive-image'),
 *    alt: 'My cool photo',
 *    sources: [{
 *      size: 235,
 *      images: [
 *          'https://placeimg.com/235/235/arch',
 *          'https://placeimg.com/470/470/arch',
 *          'https://placeimg.com/705/705/arch'
 *      ]
 *    }]
 *  }).render();
 */
import View from 'view/view'
import template from 'component/responsive_image/template/responsive_image.tmpl'
import picturefill from 'vendor/picturefill'

export default View.extend({
    template,

    defaultOptions: {
        alt: '',
        title: '',
        sources: null, // array
        imageScale: false,
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions, { sources: [] })
    },

    // Convert source(s) to srcset
    // => "src1 1x, src2 2x"
    _toSrcSet(sources) {
        if (!Array.isArray(sources)) {
            return `${sources} 1x`
        }

        return sources.map((source, index) => `${source} ${index + 1}x`).join(', ')
    },

    render() {
        let largestImg = this.options.sources.slice(-1)[0].images

        if (Array.isArray(largestImg)) {
            largestImg = largestImg.slice(-1)[0]
        }

        this.$el.html(
            this.template({
                imagesData: {
                    alt: this.options.alt,
                    title: this.options.title,
                    images: this.options.sources.map(({ size, images }) => ({
                        size,
                        srcset: this._toSrcSet(images),
                    })),
                    defaultImage: largestImg,
                },
                options: {
                    imageScale: this.options.imageScale,
                },
            })
        )

        // http://scottjehl.github.io/picturefill/#api
        picturefill({ elements: this.$('img')[0] })

        // Unfortunately this ugly hack is the only way to make picturefill pick up the recently-appended picture image
        // above on old android browsers. I suspect it relates to the first picturefill() call not finding the
        // <picture> element on the page yet because the browser is too slow to add it to the DOM.
        // Since picturefill doesn't run twice on an element that has been already parsed unless the "reevaluate"
        // option is passed, this shouldn't incur major performance impact on the newer browsers/devices.
        // Related bug: INPHOTOS-111
        window.setTimeout(() => {
            picturefill({ reevaluate: false })
        }, 1000)

        return this
    },
})
