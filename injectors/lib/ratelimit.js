"use strict";

var fetch = require("node-fetch");

const discordApiRoot = "https://discord.com/api/v6";

function format(str, args){
  var keys = Object.keys(args);
  for(var i = 0; i < keys.length; i++){
    str = str.replace(new RegExp(`\\{${keys[i]}\\}`, "g"), args[keys[i]]);
  }
  return str;
}

const waitForOtherTasks = () => new Promise(setImmediate);

async function discordApiCall(discordToken, req){
  var res = await fetch(discordApiRoot + format(req.url, req.urlParams), {
    method: req.method,
    body: req.body,
    headers: {
      "Authorization": "Bot " + discordToken,
      "Content-Type": "application/json",
      "X-RateLimit-Precision": "millisecond"
    }
  });
  var result;
  var text = await res.text();
  try {
    result = JSON.parse(text);
  } catch (e) {
    result = text;
  }
  req.resolve(result);
  return res;
}

// Topics:
// Endpoint: A specific API endpoint with a specific method. A POST and GET to the same
//   URI is a different endpoint.
// Bucket: A rate-limit bucket. A group of endpoints that share the same limit.
// Hash: A bucket specialised to a major parameter. Different guilds will share the
//   same bucket, but will have different limits because their major param (guild)
//   is different. This value is endpoint.concat(major).
// Limit: A number describing how many more requests can be made.

function RateLimiter(token) {
  this.queue = [];
  this.executorRunning = false;
  this.hash2ratelim = {};
  // When a ratelimit is recieved, a setTimeout() is called
  // to reset the limit.
  // This object stores the timers.
  this.hash2rlTimer = {};
  this.endpoint2buckets = {};
  var discordToken = token;
  this.queueRequest = function (method, endpoint, params, body) {
    return new Promise((resolve => {
      this.queue.push({
        method: method,
        url: endpoint,
        urlParams: params,
        major: params.major,
        body: body,
        resolve: resolve
      });
      if (!this.executorRunning) {
        this.execute();
        this.executorRunning = true;
      }
    }).bind(this));
  }.bind(this);
  this.execute = async function () {
    if (this.executorRunning) return;
    while (this.queue.length) {
      var req = this.queue.shift();
      // Find the ratelimit bucket and don't exceed it
      var endpoint = req.method + " " + req.url;
      var bucket = this.endpoint2buckets[endpoint];
      var hash;
      // If no bucket found, no reqs have been sent
      // and we can move fwd with the req
      if (bucket) {
        // Get the hash of the rate limit, which is the bucket + major parameter
        hash = bucket + req.major;
        var limits = this.hash2ratelim[hash];
        // No more requests
        if (limits === 0) {
          // Queue the request for later
          this.queue.push(req);
          continue;
        }
      }
      // Send the request and resolve
      // Update the various dictionaries:
      // hash2ratelim, hash2rlTimer, endpoint2buckets
      var headers = (await discordApiCall(discordToken, req)).headers;
      this.endpoint2buckets[endpoint] = headers.get("X-RateLimit-Bucket");
      hash = this.endpoint2buckets[endpoint] + req.major;
      this.hash2ratelim[hash] = headers.get("X-RateLimit-Remaining");
      if (!this.hash2rlTimer[hash]) {
        this.hash2rlTimer[hash] = setTimeout(lHash => {
          this.hash2rlTimer[lHash] = null;
          this.hash2ratelim[lHash] = null;
        }, parseFloat(headers.get("X-RateLimit-Reset-After")) * 1000, hash);
      }
      // Ensure that other async tasks can run while the request loop is going
      await waitForOtherTasks();
    }
    this.executorRunning = false;
  }.bind(this);
}

module.exports = async function injectorMain(gs){
  await gs.require("util.js");
  gs.rateLimiter = new RateLimiter(gs.getToken("discordapi"));
  gs.discordApiCall = gs.rateLimiter.queueRequest;
};

module.exports.RateLimiter = RateLimiter;