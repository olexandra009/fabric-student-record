import express from 'express';
import FabricCAService from 'fabric-ca-client';
import { Gateway, InMemoryWallet, X509WalletMixin } from 'fabric-network';

import yaml from 'js-yaml';
import path from 'path';
import * as fs from 'fs';


const router = express.Router();

const registerUser = async (login, password, ca, admin, isStudent) => {
  console.log(login);
  const affiliation = (isStudent) ? "org1.student" : "org1.teacher";
  return await ca.register({
    enrollmentID: login,
    enrollmentSecret: password,
    role: 'client',
    affiliation: affiliation,
    maxEnrollments: -1,
  }, admin);
}

const enrollUser = async (ca, login, password) => {
  try {
    const user = await ca.enroll({ enrollmentID: login, enrollmentSecret: password });
    return user;
  } catch (err) {
    console.error(err);
    throw new Error("Enroll request with " + login + " failed");
  }
}

const userRegistration = async (login, password, isStudent, res) => {

  console.log("userRegistration ");
  console.log(login);
  const ca = new FabricCAService(`http://0.0.0.0:7054`);
  let adminData;

  try {
    adminData = await enrollUser(ca, 'admin', 'password');
  } catch (err) {
    res.status(404).json({ message: "Failed to login admin" + err.message, });
    return;
  }

  const identity = {
    label: 'client',
    certificate: adminData.certificate,
    privateKey: adminData.key.toBytes(),
    mspId: 'Org1MSP',
  };

  const wallet = new InMemoryWallet();
  const mixin = X509WalletMixin.createIdentity(identity.mspId,
    identity.certificate,
    identity.privateKey);

  try {
    await wallet.import(identity.label, mixin);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: "Failed to import wallet", });
    return;
  }

  const gateway = new Gateway();

  const connectionProfile = yaml.safeLoad(
    fs.readFileSync(path.resolve(__dirname, '../gateway/networkConnection.yaml'), 'utf8'),
  );

  const connectionOptions = {
    identity: identity.label,
    wallet,
    discovery: { enabled: false, asLocalhost: true },
  };

  try {
    await gateway.connect(connectionProfile, connectionOptions);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: "Failed to create connection", });
    return;
  }

  let admin;
  try {
    admin = await gateway.getCurrentIdentity();
  } catch (err) {
    console.error(err);
    gateway.disconnect();
    res.status(404).json({ message: "Failed to get admin identity", });
    return;
  }

  let secret;
  try {
    secret = await registerUser(login, password, ca, admin, isStudent);
  } catch (err) {
    console.error(err);
    gateway.disconnect();
    res.status(409).json({
      message: "Error during registration. User with such login is exists",
      details: err.message,
    });
    return;
  }

  let userData;
  try {
    userData = await enrollUser(ca, login, secret);
  } catch (err) {
    gateway.disconnect();
    res.status(409).json({ message: err.message, });
    return;
  }

  gateway.disconnect();
  console.log(userData.certificate);
  console.log(userData.key.toBytes());
  res.status(201).json({
    login,
    certificate: userData.certificate,
    privateKey: userData.key.toBytes(),
  });
};


const registerStudent = async (req, res) => {
  const { login, password } = req.body;
  console.log("studentRegistration ");
  console.log(login);
  await userRegistration(login, password, true, res);
}

const registerTeacher = async (req, res) => {
  const { login, password } = req.body;
  await userRegistration(login, password, false, res);
}


router.post('/student', registerStudent);
router.post('/teacher', registerTeacher);

export default router;