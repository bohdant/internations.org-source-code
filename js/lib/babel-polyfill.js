// babel will compile this to replace it with individual requires for babel-polyfill based on environment
// See: https://babeljs.io/blog/2019/03/19/7.4.0#migration-from-core-js-2
import 'core-js/stable'

// explicit polyfill for String.prototype.padStart.
import 'core-js/modules/es.string.pad-start'
import 'regenerator-runtime/runtime'
