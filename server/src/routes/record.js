import express from 'express';
import { X509WalletMixin } from 'fabric-network';
import { getCA, getConnectedWallet, registerUser, sendTransaction } from '../utils';

const router = express.Router();
const createStudentRecord = async (req, res) => {
    const { certificate, privateKey, studentEmail, studentFullName } = req.body;
    console.log(certificate);
    console.log(privateKey)
    try {
        const mixin = X509WalletMixin.createIdentity(
            "Org1MSP",
            certificate,
            privateKey
        );
        const gateway = await getConnectedWallet("Org1MSP", mixin);
        const result = await sendTransaction(gateway, {
            name: 'createStudentRecord',
            props: [studentEmail, studentFullName]
        });
        gateway.disconnect();
        res.status(201).json({ data: result });
    }
    catch (e) {
        console.log(e);
        res.status(400).json({ message: e.message });
    }
};


const createSubjectToStudentRecord = async (req, res) => {
    //createSubjectToStudentRecord(ctx, studentEmail, semesterNumber, subjectName)
    const { certificate, privateKey, studentEmail, subjectName, semesterNumber } = req.body;
    console.log(certificate);
    console.log(privateKey)
    try {
        const mixin = X509WalletMixin.createIdentity(
            "Org1MSP",
            certificate,
            privateKey
        );
        const gateway = await getConnectedWallet("Org1MSP", mixin);
        const result = await sendTransaction(gateway, {
            name: 'createSubjectToStudentRecord',
            props: [studentEmail, semesterNumber, subjectName]
        });
        gateway.disconnect();
        res.status(201).json({ data: result });
    }
    catch (e) {
        console.log(e);
        res.status(400).json({ message: e.message });
    }
};



const getStudentData = async (req, res) => {
    const { certificate, privateKey, studentEmail } = req.body;
    console.log(certificate);
    console.log(studentEmail);
    console.log(privateKey);
    try {
        const mixin = X509WalletMixin.createIdentity(
            "Org1MSP",
            certificate,
            privateKey
        );
        const gateway = await getConnectedWallet("Org1MSP", mixin);
        const result = await sendTransaction(gateway, {
            name: 'getStudentData',
            props: [studentEmail]
        });
        gateway.disconnect();
        res.status(201).json({ data: result });
    }
    catch (e) {
        console.log(e);
        res.status(400).json({ message: e.message });
    }
};
// createGrageToRecord(ctx, studentEmail, semesterNumber, subjectName, title, rating)
const createGrageToRecord = async (req, res) => {
    const { certificate, privateKey, studentEmail, semesterNumber, subjectName, title, rating } = req.body;
    console.log(certificate);
    console.log(privateKey)
    try {
        const mixin = X509WalletMixin.createIdentity(
            "Org1MSP",
            certificate,
            privateKey
        );
        const gateway = await getConnectedWallet("Org1MSP", mixin);
        const result = await sendTransaction(gateway, {
            name: 'createGrageToRecord',
            props: [studentEmail, semesterNumber, subjectName, title, rating]
        });
        gateway.disconnect();
        res.status(201).json({ data: result });
    }
    catch (e) {
        console.log(e);
        res.status(400).json({ message: e.message });
    }
};

const getStudentAllGradesFromRecord = async (req, res) => {
    const { certificate, privateKey, studentEmail } = req.body;
    console.log(certificate);
    console.log(studentEmail);
    console.log(privateKey);
    try {
        const mixin = X509WalletMixin.createIdentity(
            "Org1MSP",
            certificate,
            privateKey
        );
        const gateway = await getConnectedWallet("Org1MSP", mixin);
        const result = await sendTransaction(gateway, {
            name: 'getStudentAllGradesFromRecord',
            props: [studentEmail]
        });
        gateway.disconnect();
        res.status(201).json({ data: result });
    }
    catch (e) {
        console.log(e);
        res.status(400).json({ message: e.message });
    }
};

//getStudentSemesterGradesFromRecord(ctx, studentEmail, semesterNumber) 
const getStudentSemesterGradesFromRecord = async (req, res) => {
    const { certificate, privateKey, studentEmail, semesterNumber } = req.body;
    console.log(certificate);
    console.log(studentEmail);
    console.log(privateKey);
    try {
        const mixin = X509WalletMixin.createIdentity(
            "Org1MSP",
            certificate,
            privateKey
        );
        const gateway = await getConnectedWallet("Org1MSP", mixin);
        const result = await sendTransaction(gateway, {
            name: 'getStudentSemesterGradesFromRecord',
            props: [studentEmail, semesterNumber]
        });
        gateway.disconnect();
        res.status(201).json({ data: result });
    }
    catch (e) {
        console.log(e);
        res.status(400).json({ message: e.message });
    }
};


router.get('/', getStudentData);

router.post('/', createStudentRecord);
router.post('/subject', createSubjectToStudentRecord);
router.post('/grade', createGrageToRecord);
router.get('/grade/all', getStudentAllGradesFromRecord);
router.get('/grade/semester', getStudentSemesterGradesFromRecord);
export default router;