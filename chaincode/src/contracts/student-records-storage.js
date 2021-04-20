'use strict';

const { Contract } = require('fabric-contract-api');
const { ClientIdentity } = require('fabric-shim');

class StudentRecordsStorage extends Contract {
  constructor() {
    super('org.fabric.studentRecordsStorage');
  }

  async createStudentRecord(ctx, studentEmail, fullName) {
    const identity = new ClientIdentity(ctx.stub);
    if (identity.cert.subject.organizationalUnitName !== "admin" && identity.cert.subject.organizationalUnitName !== "teacher") {
      throw new Error("Current subject is not have access to this function");
    }
    const recordAsBytes = await ctx.stub.getState(studentEmail);

    if (recordAsBytes.toString().length !== 0) {
      throw new Error("Student with the current email already exist");
    }

    const recordExample = {
      fullName: fullName,
      semesters: [],
    };
    const newRecordInBytes = Buffer.from(JSON.stringify(recordExample));
    await ctx.stub.putState(studentEmail, newRecordInBytes);
    return JSON.stringify(recordExample, null, 2);
  }

  async createSubjectToStudentRecord(ctx, studentEmail, semesterNumber, subjectName) {
    const identity = new ClientIdentity(ctx.stub);
    if (identity.cert.subject.organizationalUnitName !== "admin" && identity.cert.subject.organizationalUnitName !== "teacher") {
      throw new Error("Current subject is not have access to this function");
    }

    const recordAsBytes = await ctx.stub.getState(studentEmail);
    if (recordAsBytes.toString().length === 0) {
      throw new Error("Student with the current email not exist");
    }
    const recordAsObject = JSON.parse(recordAsBytes);

    if (!recordAsObject.semesters[semesterNumber]) {
      recordAsObject.semesters[semesterNumber] = {};
    }

    recordAsObject.semesters[semesterNumber][subjectName] = {
      lector: identity.cert.subject.commonName,
      themes: []
    }


    let recordExample = {
      semesterNumber,
      subjectName,
      lector: identity.cert.subject.commonName,

    }
    const newRecordInBytes = Buffer.from(JSON.stringify(recordAsObject));

    await ctx.stub.putState(studentEmail, newRecordInBytes);

    return JSON.stringify(recordExample, null, 2);

  }

  async createGrageToRecord(ctx, studentEmail, semesterNumber, subjectName, title, rating) {
    const identity = new ClientIdentity(ctx.stub);
    if (identity.cert.subject.organizationalUnitName !== "admin" && identity.cert.subject.organizationalUnitName !== "teacher") {
      throw new Error("Current users is not have access to this function");
    }
    const recordAsBytes = await ctx.stub.getState(studentEmail);
    if (recordAsBytes.toString().length === 0) {
      throw new Error("Student with the current email not exist");
    }
    const recordAsObject = JSON.parse(recordAsBytes);
    if (!recordAsObject.semesters[semesterNumber]) {
      throw new Error("Semester with current number has not been created");
    }
    if (!recordAsObject.semesters[semesterNumber][subjectName]) {
      throw new Error("Subject has not been created");
    }
    if (rating < 0) {
      throw new Error("Rating must be positive number");
    }

    const recordExample = {
      rating,
      title,
      date: new Date(),
    };
    recordAsObject.semesters[semesterNumber][subjectName].themes.push(recordExample);

    const newRecordInBytes = Buffer.from(JSON.stringify(recordAsObject));
    await ctx.stub.putState(studentEmail, newRecordInBytes);

    return JSON.stringify(recordExample, null, 2);

  }

  async getStudentAllGradesFromRecord(ctx, studentEmail) {
    const recordAsBytes = await ctx.stub.getState(studentEmail);
    if (recordAsBytes.toString().length === 0) {
      throw new Error("Student with the current email not exist");
    }
    const recordAsObject = JSON.parse(recordAsBytes);
    return JSON.stringify(recordAsObject, null, 2);
  }
  async getStudentSemesterGradesFromRecord(ctx, studentEmail, semesterNumber) {
    const recordAsBytes = await ctx.stub.getState(studentEmail);
    if (recordAsBytes.toString().length === 0) {
      throw new Error("Student with the current email not exist");
    }
    const recordAsObject = JSON.parse(recordAsBytes);
    const result = recordAsObject.semesters[semesterNumber] || [];
    return JSON.stringify(result, null, 2);
  }

  async getStudentData(ctx, studentEmail) {
    const recordAsBytes = await ctx.stub.getState(studentEmail);
    if (recordAsBytes.toString().length === 0) {
      throw new Error("Student with the current email not exist");
    }
    const recordAsObject = JSON.parse(recordAsBytes.toString());
    return JSON.stringify(recordAsObject, null, 2);
  }


}



module.exports = StudentRecordsStorage;
