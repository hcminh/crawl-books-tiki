const axios = require('axios').default;
const cheerio = require("cheerio");
const fs = require("fs");
const sanitizeHtml = require('sanitize-html');
const accents = require('remove-accents');
const sanitizeOpt = {
    allowedTags: [],
    allowedAttributes: {},
    // Lots of these won't come up by default because we don't allow them
    selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
    // URL schemes we permit
    allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel'],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: [],
    allowProtocolRelative: true,
    enforceHtmlBoundary: false
}

const URL = `https://tiki.vn/chuong-trinh/sach-ban-chay?src=mega-menu`;
const API = `https://tiki.vn/api/v2/products/`;
// const INCLUDE = `?include=breadcrumbs`;
const listIds = [];

(async function crawler() {
    const res = await axios.get(URL);
    const $ = cheerio.load(res.data);
    const listA = $('[data-view-id="lp_product_item"]');
    const listHref = listA.map((it) => listA[it].attribs.href);
    const listIds = [];
    for (let i = 0; i < listHref.length; i++) {
        const arr = listHref[i].split('.')[0].split('-');
        const pIds = arr[arr.length - 1];
        const id = pIds.substring(1);
        listIds.push(id);
    }

    const data_books = [];
    const data_authors = [];
    const data_publishers = [];
    const data_categories = [];
    for (let i = 0; i < listIds.length; i++) {
        const res = await axios.get(API + listIds[i]);
        const json = res.data;
        const groups = json['productset_group_name'].split('/');
        groups.shift();
        const categories = [];
        for (let j = 0; j < groups.length; j++) {
            categories.push({
                name: groups[j],
                slug: nonAccentVietnamese(groups[j]).split(' ').join('-')
            })
        }
        const attributes = json['specifications'][0]['attributes'];
        const publishers = [];
        for (let k = 0; k < attributes.length; k++) {
            // console.log(attributes[i]?.name);
            if (attributes[k]?.name == "Nhà xuất bản") {
                console.log(attributes[k]?.value);
                publishers.push({
                    name: attributes[k]['value'],
                    slug: nonAccentVietnamese(attributes[k]['value']).split(' ').join('-')
                })
            }
        }
        const book = {
            name: json['name'],
            thumbnail_url: json['thumbnail_url'],
            short_description: sanitizeHtml(json['short_description'], sanitizeOpt).replace(/\n/g, ' '),
            description: sanitizeHtml(json['description'], sanitizeOpt).replace(/\n/g, ' '),
            categories: categories,
            publisher: publishers[0] ?? json['publisher'],
            authors: json['authors'],
            specifications: json['specifications']
        }
        // a.push.apply(a, [1,2])
        data_books.push(book);
        data_authors.push.apply(data_authors, book.authors);
        data_publishers.push(book.publisher);
        data_categories.push.apply(data_categories, book.categories);
    }

    fs.writeFile('./contents/books-v3.json', JSON.stringify(data_books), (err) => {
        if (err) throw err;
        console.log('The books-v3.json has been saved!');
    });

    fs.writeFile('./contents/authors-v3.json', JSON.stringify(data_authors), (err) => {
        if (err) throw err;
        console.log('The authors-v3.json has been saved!');
    });

    fs.writeFile('./contents/publishers-v3.json', JSON.stringify(data_publishers), (err) => {
        if (err) throw err;
        console.log('The publishers-v3.json has been saved!');
    });

    fs.writeFile('./contents/categories-v3.json', JSON.stringify(data_categories), (err) => {
        if (err) throw err;
        console.log('The categories-v3.json has been saved!');
    });

})();

function nonAccentVietnamese(str) {
    str = str.toLowerCase();
    //     We can also use this instead of from line 11 to line 17
    //     str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
    //     str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
    //     str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
    //     str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
    //     str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
    //     str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
    //     str = str.replace(/\u0111/g, "d");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
}