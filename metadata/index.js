const fs = require("fs");
const parse = require('csv-parser');
const path = require('path');
const IPFS =  require("ipfs");
const axios =  require("axios");
const FormData = require('form-data');
const recursive = require('recursive-fs');


const pinFileToIPFS = async (name, path, pinataApiKey, pinataSecretApiKey) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    data.append('file', fs.createReadStream(path));
    const metadata = JSON.stringify({
        name: name,
    });
    data.append('pinataMetadata', metadata);
    //pinataOptions are optional
    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    });
    data.append('pinataOptions', pinataOptions);
    await axios
        .post(url, data, {
            maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
            }
        });
    console.log("Pined " + name);
};

const pinDirectoryToIPFS = async (name, path, pinataApiKey, pinataSecretApiKey) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    //we gather the files from a local directory in this example, but a valid readStream is all that's needed for each file in the directory.
    recursive.readdirr(src, function (err, dirs, files) {
        let data = new FormData();
        files.forEach((file) => {
            //for each file stream, we need to include the correct relative file path
            data.append(`file`, fs.createReadStream(file), {
                filepath: basePathConverter(src, file)
            });
        });
        const metadata = JSON.stringify({
            name: 'testname',
            keyvalues: {
                exampleKey: 'exampleValue'
            }
        });
        data.append('pinataMetadata', metadata);
        return axios
            .post(url, data, {
                maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large directories
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataSecretApiKey
                }
            })
            .then(function (response) {
                //handle response here
            })
            .catch(function (error) {
                //handle error here
            });
    });
    console.log("Pined directory " + name);
};

const cidFromImage = async (node, path) => {
    const file = fs.readFileSync(path);
    const ipfsFile = await node.add(file)
    return ipfsFile.cid;
    // return "ipfs";
};

(async () => {
    const node = await IPFS.create();
    const csvData=[];
    await new Promise((resolve) => {
        fs.createReadStream(path.join(__dirname, "./input/data.csv"))
            .pipe(parse({ delimiter: "," }))
            .on('data', function (csvrow) {
                //do something with csvrow
                csvData.push(csvrow);
            })
            .on('end', function () {
                resolve();
                //do something with csvData
            });
    });
    for (const nftData of csvData) {
        const filePath = path.join(__dirname, "./input/images/ " + nftData.image_number + ".jpg");
        await pinFileToIPFS(nftData.image_number, filePath, "349d6d9be6b76fffce7f", "448c37f763cd4eb9cbb9be3877e93f0f087d1074e560beba54018da67937571e");
        fs.writeFileSync(path.join(__dirname, "./output/" + nftData.image_number), JSON.stringify({
            name: nftData.nft_name,
            description: nftData.nft_description,
            external_url: "https://www.theoutsidersart.io/",
            image: `ipfs://${await cidFromImage(node, filePath)}`,
            attributes: [{
                trait_type: "Signed",
                value: nftData["attributes.signed"] === "TRUE",
            }, {
                trait_type: "Reversed",
                value: nftData["attributes.reversed"] === "TRUE",
            }, {
                trait_type: "Augmented Reality",
                value: nftData["attributes.augmented_reality"] === "TRUE",
            }]
        }))
    }
    console.log("Done");
})()

/*
API Key: 349d6d9be6b76fffce7f
API Secret: 448c37f763cd4eb9cbb9be3877e93f0f087d1074e560beba54018da67937571e
JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4NmFhMGY1YS0wOGNjLTQxMzYtYmE5OC04NTE5NjYxNDEzZjAiLCJlbWFpbCI6ImFjYXJyZXJhQHBlZXJzeXN0LmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2V9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIzNDlkNmQ5YmU2Yjc2ZmZmY2U3ZiIsInNjb3BlZEtleVNlY3JldCI6IjQ0OGMzN2Y3NjNjZDRlYjljYmI5YmUzODc3ZTkzZjBmMDg3ZDEwNzRlNTYwYmViYTU0MDE4ZGE2NzkzNzU3MWUiLCJpYXQiOjE2MzgyMTM5MTl9.labUHwWzRD96xcFmTWIQVSrflev2mWHZZMZ8Nc3-9YE
 */