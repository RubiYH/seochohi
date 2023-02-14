const agentInfo = (req) => {
  return `${req?.useragent?.browser} ${req?.useragent?.version} (${req?.useragent?.os}, ${req?.useragent?.platform})`;
};

module.exports = { agentInfo };
