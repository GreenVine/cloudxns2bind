const converter = require('./convert');

const soa = {
    mname: 'nameserver.com',
    rname: 'hostmaster.example.com'
};
const domain = 'example.com';
const infile = './cloudxns_exported.csv';
const outfile = './rfc1035_dns.conf';
const defaultTTL = 600;
const skipRow = 1;

converter(domain, soa, infile, outfile, defaultTTL, skipRow)
    .then((zone) => {
        console.log(`File converted successfully:\n\n${zone}`);
    })
    .catch((err) => {
        console.error(`An error occurred when converting the file:\n${err.message || 'No detailed error information'}`);
    });