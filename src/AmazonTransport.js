const { Transport } = require('@opensearch-project/opensearch')

function awaitAwsCredentials (awsConfig) {
  return new Promise((resolve, reject) => {
    awsConfig.getCredentials((err) => {
      err ? reject(err) : resolve()
    })
  })
}

module.exports = awsConfig => {
  class AmazonTransport extends Transport {
    request (params, options = {}, callback = undefined) {
      // options is optional, so if it is omitted, options will be the callback
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      // Promise support
      if (typeof callback === 'undefined') {
        return awaitAwsCredentials(awsConfig)
          .then(() => super.request(params, options))
      }

      // Callback support
      // Removed .then() chain due to a bug https://github.com/opensearch-project/opensearch-js/issues/185
      // .then() was calling then (onFulfilled, onRejected) on transportReturn, resulting in a null value exception
      awaitAwsCredentials(awsConfig).then();

      try {
          super.request(params, options, callback);
      } catch (err) {
          callback(err, { body: null });
      }
    }
  }

  return AmazonTransport
}
