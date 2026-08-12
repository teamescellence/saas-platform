const os = require('os');

function getDevOrigins() {
  const ips = ['localhost', '127.0.0.1'];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const list = interfaces[name];
    if (list) {
      for (const item of list) {
        if (item.family === 'IPv4' && !item.internal) {
          ips.push(item.address);
        }
      }
    }
  }
  return ips;
}

module.exports = getDevOrigins();
