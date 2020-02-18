/**
 * Defines the set of options to use given a semantic "key" describing the usage of the popover.
 * This improves upon the current design in that the consumer of the popover no longer needs to
 * understand the suite of available options in its entirety but instead can reuse existing sets
 * of options based on the semantic usage.  For example, all "tooltips" will have the same config.
 *
 * `base` described the default behavior if no type is given, and then types override this base.
 *
 * Usage: popoverOptions([type]);
 *
 * Trigger Element = The `el` of popover, the thing which opens the popover itself
 */

const config = {
    // Base properties for all Popovers

    base: {
        name: '', // The name of the popover

        // Bootstrap Popover Options

        animation: false, // Animate the popover appearance
        html: true, // Popover contents are HTML
        placement: 'bottom', // Popover direction [top, bottom, left, right, auto]
        content: '', // Popover content

        // Template Options

        extraClasses: '', // Classes applied to the wrapper, passed to template
        showPopoverCloseBelowMaxPageWidth: false, // Close button on mobile/tablet views, passed to template

        // View Options

        hoverToggle: true, // Hover Trigger Element to open and close
        clickToggle: true, // Click Trigger Element to open and close
        clickBodyClose: true, // Click Body to close
        clickContentClose: true, // Allow clicking the popover content to close

        delayOpen: 50, // (requires hoverToggle) Delay in open on mouseover
        delayClose: 500, // (requires hoverToggle) Delay in close on mouseout

        belowMaxPageWidthDisableBodyScroll: false, // When popover open, body cannot scroll when < desktop
        mobileFullWidth: false, // Display the modal at the full screen with on mobile (also hides arrow)
    },

    // Popover Presets
    // - overrides `base` types above via Object.assign(base [, specificTypes])

    tooltip: {
        placement: 'top',

        extraClasses: 'popover-tooltip',

        clickToggle: false,
        hoverToggle: true,

        delayClose: 200,
    },

    formTooltip: {
        placement: 'right',

        clickToggle: false,
        hoverToggle: false,

        clickBodyClose: false,
    },

    dropdown: {
        hoverToggle: false,
        clickContentClose: false,
    },

    dropdownWithClose: {
        hoverToggle: false,
        clickContentClose: false,
        showPopoverCloseBelowMaxPageWidth: true,
    },

    navigationalDropdown: {
        clickToggle: false,
        hoverToggle: false,
        clickContentClose: false,
        belowMaxPageWidthDisableBodyScroll: true,
    },

    navigationalDropdownWithClose: {
        clickToggle: false,
        hoverToggle: false,
        clickContentClose: false,
        belowMaxPageWidthDisableBodyScroll: true,
        showPopoverCloseBelowMaxPageWidth: true,
    },
}

export default type => ({
    ...config.base,
    ...(type && config[type]),
})
