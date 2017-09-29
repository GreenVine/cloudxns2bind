const fs = require('fs');
const dns = require('dns-zonefile');
const csv = require('node-csv-parse');


class Converter {

    parseInput(infile) {
        return new Promise((resolve) => resolve(fs.readFileSync(infile, 'utf8')))
            .then((records) => csv.parseAsRows(records, ','))
    }

    buildZoneFile(domain, soa, records, ttl, offset) {
        const recordTypes = ['A', 'CNAME', 'NS', 'MX', 'TXT', 'AAAA', 'SRV'];

        const ttlDefault = !ttl || isNaN(ttl) || ttl < 0 ? 3600 : ttl;

        let zone = {
            $origin: domain,
            $ttl: ttl || ttlDefault,
            soa: {
                mname: soa.mname,
                rname: soa.rname,
                serial: '{time}',
                refresh: soa.refresh || 3600,
                retry: soa.retry || 600,
                expire: soa.expire || 604800,
                minimum: soa.minimum || 86400
            }
        };

        const rec = records.slice(offset).reduce((acc, rec) => {
            let tmp = acc;

            if (!rec || rec.length !== 6 || recordTypes.indexOf(rec[1].toUpperCase()) < 0) {
                console.error(`Record [ ${rec} ] is invalid or not supported, skipped.`);
                return tmp;
            }

            const curRecordType = rec[1].toLowerCase();
            if (!tmp[curRecordType]) tmp[curRecordType] = []; // init record type

            if (rec[0] === '@') rec[0] = domain + '.'; // enforce FQDN
            else rec[0] = `${rec[0]}.${domain}.`;

            let recordAdd;

            switch (curRecordType) {
                case 'aaaa':
                case 'a': {
                    recordAdd = {
                        name: rec[0],
                        ip: rec[3]
                    };
                    break;
                }
                case 'cname': {
                    recordAdd = {
                        name: rec[0],
                        alias: rec[3]
                    };
                    break;
                }
                case 'ns': {
                    recordAdd = {
                        host: rec[3]
                    };
                    break;
                }
                case 'mx': {
                    recordAdd = {
                        host: rec[3],
                        preference: rec[4]
                    };
                    break;
                }
                case 'txt': {
                    recordAdd = {
                        name: rec[0],
                        txt: rec[3]
                    };
                    break;
                }
                case 'srv': {
                    const srv = rec[3].split(' ');

                    if (!srv || srv.length !== 4) {
                        console.error(`SRV Record [ ${rec} ] is invalid, skipped.`);
                        return tmp;
                    }

                    recordAdd = {
                        name: rec[0],
                        priority: srv[0],
                        weight: srv[1],
                        port: srv[2],
                        target: srv[3]
                    };
                    break;
                }
            }

            recordAdd['ttl'] = rec[2] || ttlDefault;
            tmp[curRecordType].push(recordAdd);

           return tmp;
        }, zone);

        return dns.generate(rec);
    }

    writeZoneFile(conf, outfile) {
        return new Promise((resolve, reject) => {
            fs.writeFile(outfile, conf, (err) => {
                if (err) reject(err);
                else resolve(conf);
            });
        })
    }

}

module.exports = (domain, soa, infile, outfile, ttl, rowsOffset) => {
    const conv = new Converter();

    return conv.parseInput(infile)
        .then((records) => conv.buildZoneFile(domain, soa, records, ttl, rowsOffset))
        .then((conf) => conv.writeZoneFile(conf, outfile));
};