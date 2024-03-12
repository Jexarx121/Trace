require('dotenv').config();

const { Defender } = require('@openzeppelin/defender-sdk');
const { readFileSync, appendFileSync } = require('fs');

async function main() {
  const { relayer: { relayerId }} = JSON.parse(readFileSync('./relay.json'))
  const creds = { apiKey: process.env.DEFENDER_API_KEY, apiSecret: process.env.DEFENDER_API_SECRET_KEY };
  const client = new Defender(creds);

  const { actionId } = await client.action.create({
    name: "Relayer Meta Transactions",
    encodedZippedCode: await client.action.getEncodedZippedCodeFromFolder('./build/action'),
    relayerId: relayerId,
    trigger: {
      type: 'webhook'
    },
    paused: false
  });

  console.log("Action created with ID", actionId);

  appendFileSync('.env', `\nACTION_ID="${actionId}"`, function (err) {
    if (err) throw err;
 });
}

if (require.main === module) {
  main().catch(console.error);
}