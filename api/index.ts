// Vercel serverless entry point. Bridges Vercel's Node runtime to the
// Expo Router server build (dist/server) so API routes like /analyze run
// on the server — where ANTHROPIC_API_KEY stays secret — instead of the device.
const { createRequestHandler } = require('expo-server/adapter/vercel');

module.exports = createRequestHandler({
  build: require('path').join(__dirname, '../dist/server'),
});
