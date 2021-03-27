import express from 'express';
import FabricCAServices from 'fabric-ca-client';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const router = express.Router();
const studentRegistration = async (req, res) => {
  let caInfo = yaml.safeLoad(fs.readFileSync('../gateway/fabric-ca-client-config.yaml', 'utf8'));
  const caTLSCACerts = caInfo.tlsCACerts.pem;
  const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
};
router.post('/student', studentRegistration);

export default router;
