// These styles are referenced by composes only, which causes them to never actually be output by Rollup
// so we need to import them for "side-effects" here so they actually exist in the output
import './Root.module.css';
import './inputBase.module.css';
import './i18n.module.css';
