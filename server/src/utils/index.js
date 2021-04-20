import { Gateway, InMemoryWallet } from 'fabric-network';
import FabricCAService from 'fabric-ca-client';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export const getCA = () => {
  try {
    return new FabricCAService(`http://0.0.0.0:7054`)
  } catch (e) {
    console.error(e)
    throw new Error(e.message)
  }
}
export const getConnectedWallet = async (label, mixin) => {
  const wallet = new InMemoryWallet();
  await wallet.import(label, mixin);
  const gateway = new Gateway();
  const connectionProfile = yaml.safeLoad(
    fs.readFileSync(path.resolve(__dirname, '../gateway/networkConnection.yaml'), 'utf8'),
  );
  const connectionOptions = {
    identity: label,
    wallet,
    discovery: { enabled: false, asLocalhost: true },
  };
  await gateway.connect(connectionProfile, connectionOptions);
  return gateway;
}
export const registerUser = async (ca, adminWallet, userData) => {
  try {
    await ca.register({
      enrollmentID: userData.login,
      enrollmentSecret: userData.password,
      role: 'client',
      affiliation: `org1.${userData.affiliation}`,
      maxEnrollments: -1,
    }, adminWallet);
  }
  catch (e) {
    console.error(e.message)
    throw new Error(e.message);
  }
}

export const sendTransaction = async (gateway, transaction) => {
  try {
    const network = await gateway.getNetwork('testchannel');
    const contract = await network.getContract('recordcontract',
      'org.fabric.studentRecordsStorage');
    const issueResponse = await contract.submitTransaction(transaction.name, ...transaction.props);
    return JSON.parse(issueResponse.toString());
    // return true;
  }
  catch (error) {
    console.log(`Error processing transaction. ${error.stack}`);
    gateway.disconnect();
    return null;
  }
}
