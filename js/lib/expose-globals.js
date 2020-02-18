// Expose jQuery to the worl.. *ahem*, to the external dependencies that
// assume jQuery is in the global scope. See:  https://www.youtube.com/watch?v=F-mjl63e0ms
import $ from 'jquery'
import mOxie from 'vendor/moxie'

window.mOxie = mOxie
window.$ = $
window.jQuery = $
