const config = {
    soa: {
        mname: 'nameserver.com',
        rname: 'hostmaster.example.com'
    },
    domain: 'example.com',
    infile: 'import/cloudxns.csv',
    outfile: '../export/rfc1035_dns.txt',
    ttl: 600,
    skipRow: 1
};

require('./convert')(config.domain, config.soa, config.infile, config.outfile, config.ttl, config.skipRow)
    .then((zone) => {
        console.log(`File converted successfully:\n\n${zone}`);
    })
    .catch((err) => {
        console.error(`An error occurred when converting the file:\n${err.message || 'No detailed error information'}`);
    });