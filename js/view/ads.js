import _ from 'lodash'
import View from 'view/view'
import dispatcher from 'service/event_dispatcher'
import AdView from 'view/ad'
import { BREAKPOINTS } from 'view/window'

const AdsComponent = View.extend({
    initialize(options) {
        this._googletag = options.googletag
        this._dfpCode = options.dfpCode

        this.ads = []
    },

    initializeAds(adSlots) {
        this._googletag.cmd.push(() => {
            _.each(adSlots, ad => {
                this.ads.push(ad)

                const slot = this._googletag
                    .defineSlot(`/${this._dfpCode}/${ad.name}`, [ad.width || 0, ad.height || 0], ad.name)
                    .defineSizeMapping(this._getSizeMappingForSlot(ad))
                    .addService(this._googletag.pubads())
                    .setCollapseEmptyDiv(true, true)
                    .setForceSafeFrame(true)
                    .setSafeFrameConfig({
                        allowOverlayExpansion: false,
                        allowPushExpansion: false,
                        sandbox: true,
                    })

                this._googletag.pubads().addEventListener('slotRenderEnded', this.createRenderCallback(ad, slot))
            })

            this._googletag.pubads().enableSingleRequest()
            this._googletag.enableServices()

            _.each(adSlots, ad => {
                this._googletag.display(ad.name)
            })
        })
    },

    /**
     * Prepares the mapping of ad sizes for the given ad slot.
     * An ad can have up to 3 sizes defined, for mobile, tablet, and desktop sized devices.
     */
    _getSizeMappingForSlot(ad) {
        const sizeMapping = this._googletag.sizeMapping()

        if (ad.class === 'fluid') {
            _.each(BREAKPOINTS, (width, breakpoint) =>
                sizeMapping.addSize([width, 0], ad[breakpoint] || ['fluid'], ad[breakpoint] || [])
            )
        } else {
            _.each(BREAKPOINTS, (width, breakpoint) => sizeMapping.addSize([width, 0], ad[breakpoint] || []))
        }

        return sizeMapping.build()
    },

    /**
     * This gets called after every adUnit (.adContainer__ad) has decided if it will render an Ad or not
     */
    createRenderCallback(ad, slot) {
        const viewOptions = Object.assign({ el: `#${ad.name}` }, ad)
        const adView = this.initSubview(AdView, viewOptions)

        return event => {
            if (slot !== event.slot) {
                return
            }

            // Mark this ad as resolved
            ad.resolved = true

            // Will this ad slot render an ad or not?
            ad.isCollapsing = !adView.hasAdToShow()
            // if it will render, make sure no is-hidden class is there
            if (!ad.isCollapsing) {
                adView.show()
            }

            // Decide the fate of the collapseContainer, if it exists
            if (ad.collapseTarget) {
                if (this.shouldContainerCollapse(ad.collapseTarget)) {
                    // if all units inside the collapseTarget are collapsing, collapse the container(target) too
                    adView.collapseContainer()
                } else {
                    // otherwise, make sure no is-hidden class is there
                    adView.expandContainer()
                }
            }

            // If all ads have been resolved, we trigger 'redraw'
            if (this.areAllAdsResolved()) {
                this.dispatchRedraw()
            }
        }
    },

    areAllAdsResolved() {
        const firstUnresolvedAd = _.find(this.ads, ad => ad.resolved !== true)

        return firstUnresolvedAd === undefined
    },

    /**
     * Returns true if all the ad units inside the collapseTarget are collapsed too
     */
    shouldContainerCollapse(collapseContainer) {
        // Breaks after the first one, as a performance optimization
        const adNotCollapsing = _.find(
            this.ads,
            ad => ad.collapseTarget === collapseContainer && (!ad.resolved || !ad.isCollapsing)
        )

        return adNotCollapsing === undefined
    },

    dispatchRedraw() {
        dispatcher.dispatch('redraw')
    },
})

export default AdsComponent
