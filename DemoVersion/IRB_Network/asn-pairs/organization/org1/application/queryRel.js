/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access PaperNet network
 * 4. Construct request to query the ledger
 * 5. Evaluate transactions (queries)
 * 6. Process responses
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');
const {performance} = require('perf_hooks');

// Main program function
async function main() {

    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('../identity/user/asn327693/wallet');


    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();
    let  t1=performance.now()
    // Main try/catch block
    try {

        // Specify userName for network access
        const userName = 'asn327693';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org1.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled: true, asLocalhost: true }

        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);
        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract('aspaircontract');

        // Get addressability to commercial paper contract
        //console.log('Use org.papernet.commercialpaper smart contract.');

        //const contract = await network.getContract('papercontract', 'org.papernet.commercialpaper');

        // queries - commercial paper

        
        console.log('-----------------------------------------------------------------------------------------');
        console.log('****** Submitting relationship queries ****** \n\n ');
        let queryResponse4 = await contract.evaluateTransaction('queryNamed', 'issued');
        let v= queryResponse4.toString().split("[")[1].split("]")[0]
        console.log(v)

        let nRecords=v.split('Key').length;
        let  t2=performance.now()
        
        fs.writeFile('../../../../data/log/Relationship.json', v, (err) => {


           if (err) {
              throw err;
         }
        console.log("Data is saved.");
        });
        let t3=performance.now()
        
        
        console.log("Time To Process Data")
        let tDS=t3-t1
        
        var stream1 = fs.createWriteStream("../../../../data/log/TimeToReadAndStore.txt", {'flags': 'a'});
              stream1.once('open', function(fd) {
                          stream1.write(nRecords+','+tDS+"\r\n");
                        });
 
        let tR=t2-t1
        var stream2 = fs.createWriteStream("../../../../data/log/TimeToRead.txt", {'flags': 'a'});
              stream2.once('open', function(fd) {
                          stream2.write(nRecords+','+tR+"\r\n");
                        });
        //console.log(json);
        console.log('\n\n');}
         catch (error) {

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();

    }
}
main().then(() => {

    console.log('Queryapp program complete.');

}).catch((e) => {

    console.log('Queryapp program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
