## cloudxns2bind

### Introduction

Written in Node.js, this module aims to convert [CloudXNS](https://www.cloudxns.net/)'s exported DNS records to [RFC1035 compliant](http://www.ietf.org/rfc/rfc1035.txt) zone file.

This is a quick implementation, followed by an incident that [CloudXNS](https://www.cloudxns.net/) is suddenly requiring customers to submit ID documents for DNS resolution services continuing to work.

### Installation


### Usage

As a quick solution, all configurations are read from ```index.js``` directly.

- SOA (Start of Authority): Set ```mname``` to the primary name server for the domain, ```rname``` to the responsible party
- Domain: Your domain name
- Infile: Path to the CloudXNS exported file, in CSV format (Note: _Export all records as an Excel file, then convert to CSV_)
- Outfile: Path to the output file
- TTL (Time-to-Live): Default TTL, in seconds
- SkipRow: Skip the first N rows when parsing the CSV input file

    ```javascript
    const config = {
        soa: {
            mname: 'nameserver.com',
            rname: 'hostmaster.example.com'
        },
        domain: 'example.com',
        infile: 'import/cloudxns.csv',
        outfile: 'export/rfc1035_dns.txt',
        ttl: 600,
        skipRow: 1
    };
    ```