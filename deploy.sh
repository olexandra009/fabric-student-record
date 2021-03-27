#!/bin/bash
echo -----Give all permitions for project folder
sudo chmod 777 ./
echo -----Installing Binaries for Fabric
./scripts/bootstrap.sh
echo -----Run Fabric CA Server
cd ./network/ca
docker-compose up -d
echo -----Enroll admin msp
sudo ../../bin/fabric-ca-client enroll -u http://admin:password@0.0.0.0:7054 -H ./data
echo -----Backup admin msp
mkdir -p ./admin/msp
cp -r ./data/msp ./admin/
