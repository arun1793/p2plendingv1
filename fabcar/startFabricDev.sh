#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

starttime=$(date +%s)

if [ ! -d ~/.hfc-key-store/ ]; then
	mkdir ~/.hfc-key-store/
fi
cp $PWD/creds/* ~/.hfc-key-store/
# launch network; create channel and join peer to channel
cd ../chaincode-docker-devmode
#./start.sh

# Now launch the CLI container in order to install, instantiate chaincode
# and prime the ledger with our 10 cars
docker-compose -f docker-compose-simple.yaml down
sleep 10
 docker-compose -f ./docker-compose-simple.yaml up

docker exec -it chaincode bash 

cd fabcar
go build

#docker exec cli -e "CORE_PEER_ADDRESS=peer:7051" -e "CORE_CHAINCODE_ID_NAME=mycc:0" ./fabcar
docker exec cli peer chaincode install -n fabcar -v 1.0 -p github.com/fabcar
docker exec cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n fabcar -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"
sleep 10
docker exec cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n fabcar -c '{"function":"initLedger","Args":[""]}'

printf "\nTotal execution time : $(($(date +%s) - starttime)) secs ...\n\n"
