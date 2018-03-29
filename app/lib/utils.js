const config = require('./config');

function getMajorMinorVersion() {
  const parts = config.version.split('.');
  return `${parts[0]}.${parts[1]}`;
}

function asArray(obj) {
  return obj.constructor === Array ? obj : [obj];
}

function getId(field) {
  return field && field.split('/').pop();
}

module.exports = {
  asArray,
  getId,
  getMajorMinorVersion,
};
