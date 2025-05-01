const normalizeUrl = (url, options = {}) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  const urlObject = new URL(url);

  if (options.forceHttps) {
    urlObject.protocol = 'https:';
  }
  return urlObject.toString();
};

module.exports = normalizeUrl;
