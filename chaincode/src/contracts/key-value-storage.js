'use strict';

const { Contract } = require('fabric-contract-api');

class KeyValueStorage extends Contract {
  constructor() {
    super('org.fabric.keyvaluestorage');
  }

}

module.exports = KeyValueStorage;
