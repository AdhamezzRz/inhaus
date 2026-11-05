// Runs Shopify Theme Check over the theme and prints offenses (exit 1 on errors).
const path = require('path');
const { check } = require('@shopify/theme-check-node');
(async () => {
  const root = path.resolve(__dirname, '..');
  const offenses = await check(root);
  const sev = ['error', 'warning', 'info'];
  let errors = 0;
  for (const o of offenses) {
    if (o.severity === 0) errors++;
    const file = o.uri.replace('file://' + root + '/', '');
    console.log(`${sev[o.severity] || o.severity}  ${file}:${(o.start && o.start.line + 1) || ''}  [${o.check}] ${o.message}`);
  }
  console.log(`\n${offenses.length} offenses, ${errors} errors`);
  process.exit(errors ? 1 : 0);
})();
