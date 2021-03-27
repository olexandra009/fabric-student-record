# Channel for testing chaincodes

This configuration defines a channel named `naukma` with the write access
for all members of `NAUKMA` organization.

## Creating a channel

To create a channel:

- Create the genesis transaction:
  `configtxgen -asOrg NAUKMA -channelID naukma -configPath <path to this directory> -outputCreateChannelTx ./naukma_create.pb -profile TestChannel`
- Submit this transaction with:
  `peer channel create -c naukma --file ./naukma_create.pb --orderer <orderer address>:7050`.
  This command will download the genesis block of this channel.
- Add a node to a newly created channel: `peer channel join --orderer <orderer address>:7050 --blockpath ./naukma.block`
