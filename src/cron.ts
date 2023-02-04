import schedule from 'node-schedule';


import { bazosCrawler } from "./crawler.js";

// schedule.scheduleJob('0 * * * * *',  bazosCrawler)
function randomIntFromInterval(min: number, max: number) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// const proxy = [
//     {
//         "ip": "155.254.192.162",
//         "port": "80"
//     },
//     {
//         "ip": "82.119.96.254",
//         "port": "80"
//     },
//     {
//         "ip": "213.81.178.222",
//         "port": "4145"
//     },
//     {
//         "ip": "213.81.155.129",
//         "port": "4145"
//     },
//     {
//         "ip": "213.81.178.169",
//         "port": "4145"
//     },
//     {
//         "ip": "5.178.52.59",
//         "port": "1080"
//     },
//     {
//         "ip": "213.81.218.52",
//         "port": "4153"
//     },
//     {
//         "ip": "5.22.154.50",
//         "port": "32127"
//     },
//     {
//         "ip": "217.145.199.47",
//         "port": "56746"
//     },
//     {
//         "ip": "80.87.213.45",
//         "port": "8080"
//     },
//     {
//         "ip": "46.229.235.158",
//         "port": "8088"
//     },
//     {
//         "ip": "80.81.232.145",
//         "port": "5678"
//     },
//     {
//         "ip": "195.168.92.31",
//         "port": "41930"
//     },
//     {
//         "ip": "87.197.99.79",
//         "port": "8088"
//     },
//     {
//         "ip": "195.168.10.9",
//         "port": "28354"
//     }
// ]




// const testMaxRequests = async () => {
//     const requests = new Array(5000).fill(null).map((_, i) => i);
//     for await (const index of requests) {
//         try {
//             await client.get('https://www.bazos.sk/');
//             // await new Promise((res) => setTimeout(res, randomIntFromInterval(100, 200)))
//         } catch (e) {
//             console.log(e, index)
//         }
//     }
//     console.log("finish")
// }
//
// testMaxRequests();
