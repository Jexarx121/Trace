require('dotenv').config();
const { RelayClient } = require('@openzeppelin/defender-relay-client');
const { appendFileSync, writeFileSync} = require('fs');

async function run() {
  const API_KEY = process.env.DEFENDER_API_KEY;
  const API_SECRET = process.env.DEFENDER_API_SECRET_KEY;
  const relayClient = new RelayClient({apiKey: API_KEY, apiSecret: API_SECRET});

  const requestParams = {
    name: "Auto Trace Relayer",
    network: "sepolia",
    minBalance: BigInt(1e17).toString()
  };

  const relayer = await relayClient.create(requestParams);

  // store relayer info in file (optional)
  writeFileSync('relay.json', JSON.stringify({relayer}, null, 2));
  console.log('Relayer ID: ', relayer);

  // create and save the api key to .env — needed for sending tx
  const {apiKey: relayerKey, secretKey: relayerSecret} = await relayClient.createKey(relayer.relayerId);
  appendFileSync('.env', `\nRELAYER_KEY=${relayerKey}\nRELAYER_SECRET=${relayerSecret}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});