#!/bin/bash
docker network rm fabric
docker network create --driver=bridge fabric

echo -----Installing Binaries for Fabric
./scripts/bootstrap.sh

echo -----Run Fabric CA Server
cd ./network/ca
docker-compose up -d
cd ../

echo -----Enroll admin msp
sleep 2 && ../bin/fabric-ca-client enroll -u http://admin:password@0.0.0.0:7054

echo -----Backup admin msp
mkdir -p ./admin
cp -r ~/.fabric-ca-client/msp ./admin/


echo -----Create node account
../bin/fabric-ca-client register --id.name peer1 --id.affiliation naukma.teacher --id.secret passwd --id.type peer

echo -----Enroll node msp
../bin/fabric-ca-client enroll -u http://peer1:passwd@0.0.0.0:7054
cp -r ~/.fabric-ca-client/msp ./peer/data/
mkdir -p ./peer/data/msp/admincerts
cp ./admin/msp/signcerts/cert.pem ./peer/data/msp/admincerts/
cp ./msp/config.yaml ./peer/data/msp/

echo -----Run Fabric Peer Node
cd ./peer
docker-compose up -d
cd ../../

echo ----Update admin msp
rm -rf ~/.fabric-ca-client/msp
cp -r ./network/admin/msp/ ~/.fabric-ca-client/

echo -----Create node account
cd ./network
../bin/fabric-ca-client register --id.name orderer --id.affiliation naukma.teacher --id.secret passwd --id.type peer

echo -----Enroll node msp
../bin/fabric-ca-client enroll -u http://orderer:passwd@0.0.0.0:7054
cp -r ~/.fabric-ca-client/msp ./orderer/data/
mkdir -p ./orderer/data/msp/admincerts
cp ./admin/msp/signcerts/cert.pem ./orderer/data/msp/admincerts/
cp ./msp/config.yaml ./orderer/data/msp/

echo -----Run Fabric Peer Node
cd ./orderer
docker-compose up -d
cd ../../

echo ----Update admin msp
rm -rf ~/.fabric-ca-client/msp
cp -r ./network/admin/msp/ ~/.fabric-ca-client/

echo ----Change admin MSP
mkdir -p ~/.fabric-ca-client/msp/admincerts
cd network/
cp ./admin/msp/signcerts/cert.pem ~/.fabric-ca-client/msp/admincerts
cp -r ./admin/msp ./testchannel

cd testchannel

echo ----Build the channel creation transaction 
../../bin/configtxgen -asOrg NAUKMA -channelID naukma -configPath $(pwd) -outputCreateChannelTx ./naukma_create.pb -profile TestChannel 
sleep 2 && echo ----Create the channel 
cd ../
export FABRIC_CFG_PATH=$(pwd)/peer/data
export CORE_PEER_MSPCONFIGPATH=~/.fabric-ca-client/msp
../bin/peer channel create -c naukma --file ./testchannel/naukma_create.pb --orderer 0.0.0.0:7050 
sleep 2 && echo ----Join the existing nodes to the channel 

../bin/peer channel join --orderer 172.28.0.5:7050 --blockpath ./naukma.block

sleep 2 && echo ----Install chaincode on the node






