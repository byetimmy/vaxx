'use strict'

const BASE_SITE = process.env.BASE_SITE || 'https://www.vaccinateri.org'; // */'https://prepmod.doh.wa.gov';
const BASE_URI = process.env.BASE_URI || '/appointment/en/clinic/search?page={page}';
const CLUSTER_THREADS = process.env.CLUSTER_THREADS || '1';
const MATCH_AGE = process.env.MATCH_AGE || 'Age groups served';
const MATCH_APPT = process.env.MATCH_APPT || 'Appointments Available';
const MATCH_VAXX = process.env.MATCH_VAXX || 'Vaxxinations offered';
const MIN_AVAIL = process.env.MIN_AVAIL || '1';
const PORT = process.env.PORT || '9000';
const REGION = process.env.REGION || 'RI' // */'WA';
const REFRESH = parseInt(process.env.REFRESH || '5', 10); //seconds
const RESTART_THREASHOLD = parseInt(process.env.RESTART_THREASHOLD || '300', 10); //seconds
const USERAGENT = process.env.USERAGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36';


module.exports = {
    BASE_MATCH: MATCH_APPT,
    BASE_SITE,
    BASE_URI,
    CLUSTER_THREADS,
    MATCH_AGE,
    MATCH_APPT,
    MATCH_VAXX,
    MIN_AVAIL,
    PORT,
    REGION,
    REFRESH,
    RESTART_THREASHOLD,
    USERAGENT
};