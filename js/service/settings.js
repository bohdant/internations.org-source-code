// Get array of switches from the location hash
const switches = String(document.location.search)
    .substr(1)
    .split(',')

// Defaults
// Could eventually mixin settings from InterNations.data.settings
// (for example), but for now we stick with just this object as
// we don't need it yet.
const settings = {
    validation: {
        // Form validation on or off. Disabling this will
        // just let the validations pass, but will leave
        // all event handling in tact
        enabled: true,
    },
}

// Apply switches
if (switches.indexOf('__noValidate=1') > -1) {
    settings.validation.enabled = false
}

export default settings
