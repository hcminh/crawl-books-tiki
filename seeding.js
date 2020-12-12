const axios = require('axios').default;
const cheerio = require("cheerio");
const fs = require("fs");
const sanitizeHtml = require('sanitize-html');

const URL = `http://localhost:3001/books`;
const TOKEN = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjA3Nzg5MDUzfQ.OyC_Vsz2qSxmAvgGewPYgXRUUtDwaZTgCeB82u3CKVI`;
const CONTENT_TYPE = "application/json";

(async function seeding() {
    const rawdata = fs.readFileSync('./contents/books-v3.json');
    const objects = JSON.parse(rawdata);
    const books = [];
    for (var i in objects)
        books.push(objects[i]);

    const instance = axios.create({
        method: 'POST',
        baseURL: URL,
        headers: {
            'Content-Type': CONTENT_TYPE,
            'Authorization': TOKEN
        }
    });
    for (let index = 0; index < books.length; index++) {
        const res = await instance.request({
            data: {
                "name": books[index]['name'],
                "version": 0,
                "authors": books[index]['authors'] ?? [{ name: 'Unknown', slug: 'unknown' }],
                "description": books[index]['description'],
                "shortDescription": books[index]['short_description'],
                "thumbnailUrl": books[index]['thumbnail_url'],
                "publisher": books[index]['publisher'],
                "additionalInfo": books[index]['specifications'],
                "categories": books[index]['categories']
            },
        });
        console.log(res.status, res.statusText, res.data['name']);
    }

})();


