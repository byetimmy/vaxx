'use strict'

const AWS_ARN = process.env.AWS_ARN || 'arn:aws:sns:us-east-1:727393359243:rivaxx-notif';
const AWS_KEY = process.env.AWS_KEY || '';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_SECRET = process.env.AWS_SECRET || '';
const BASE_MATCH = process.env.BASE_MATCH || 'Appointments Available'; // */'Available Appointments';
const BASE_SITE = process.env.BASE_SITE || 'https://www.vaccinateri.org/'; // */'https://prepmod.doh.wa.gov';
const BASE_URI = process.env.BASE_URI || '/clinic/search?page={page}';
const CLUSTER_THREADS = process.env.CLUSTER_THREADS || '1';
const MIN_AVAIL = process.env.MIN_AVAIL || '1';
const PORT = process.env.PORT || '9000';
const REGION = process.env.REGION || 'RI' // */'WA';
const REFRESH = parseInt(process.env.REFRESH || '5', 10); //seconds
const RESTART_THREASHOLD = parseInt(process.env.RESTART_THREASHOLD || '300', 10); //seconds
const USERAGENT = process.env.USERAGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36';


module.exports = {
    AWS_ARN,
    AWS_KEY,
    AWS_REGION,
    AWS_SECRET,
    BASE_MATCH,
    BASE_SITE,
    BASE_URI,
    CLUSTER_THREADS,
    MIN_AVAIL,
    PORT,
    REGION,
    REFRESH,
    RESTART_THREASHOLD,
    USERAGENT
};