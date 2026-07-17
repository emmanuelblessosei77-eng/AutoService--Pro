const bcrypt = require('bcrypt');
(async () => {
  const hash = await bcrypt.hash('demo', 10);
  console.log(hash);
})();
