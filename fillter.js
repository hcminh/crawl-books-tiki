
const fs = require("fs");


(async function fillter() {

    const authors_rawdata = fs.readFileSync('./contents/authors-v3.json');
    const authors = JSON.parse(authors_rawdata);
    const filteredAuthors = [];
    const filteredAuthorIds = [];
    for (let i = 0; i < authors.length; i++) {
        if (!filteredAuthorIds.includes(authors[i]['id'])) {
            filteredAuthors.push(authors[i]);
            filteredAuthorIds.push(authors[i]['id'])
        }
    }

    const publishers_rawdata = fs.readFileSync('./contents/publishers-v3.json');
    const publishers = JSON.parse(publishers_rawdata);
    const filteredPublishers = [];
    const filteredPublisherSlugs = [];
    for (let i = 0; i < publishers.length; i++) {
        if (!filteredPublisherSlugs.includes(publishers[i]['slug'])) {
            filteredPublishers.push(publishers[i]);
            filteredPublisherSlugs.push(publishers[i]['slug'])
        }
    }

    const categories_rawdata = fs.readFileSync('./contents/categories-v3.json');
    const categories = JSON.parse(categories_rawdata);
    const filteredCategories = [];
    const filteredCategorySlugs = [];
    for (let i = 0; i < categories.length; i++) {
        if (!filteredCategorySlugs.includes(categories[i]['slug'])) {
            filteredCategories.push(categories[i]);
            filteredCategorySlugs.push(categories[i]['slug'])
        }
    }

    fs.writeFile('./filtered/authors.json', JSON.stringify(filteredAuthors), (err) => {
        if (err) throw err;
        console.log('The authors.json has been saved!');
    });

    fs.writeFile('./filtered/publishers.json', JSON.stringify(filteredPublishers), (err) => {
        if (err) throw err;
        console.log('The publishers.json has been saved!');
    });

    fs.writeFile('./filtered/categories.json', JSON.stringify(filteredCategories), (err) => {
        if (err) throw err;
        console.log('The categories.json has been saved!');
    });

})();