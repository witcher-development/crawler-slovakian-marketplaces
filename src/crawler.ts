import got, { Response } from 'got';
import * as $jsdom from 'jsdom';

import { Product } from './db.js';

const jsdom = $jsdom.JSDOM;

type Category = {
  link: string;
  name: string;
};
const categoryData = (a: HTMLLinkElement): Category => ({
  link: a.href,
  name: a.textContent || '',
});

const getLinksList = (response: Response<any>, selector: string) => {
  const { window } = new jsdom(response.body);
  const $ = window.document;
  return Array.from<HTMLLinkElement>($.querySelectorAll(selector)).map(
    categoryData,
  );
};

const cutNotInterestingCategories = (categories: Category[]) => {
  const blackList = [
    'https://reality.bazos.sk/',
    'https://praca.bazos.sk/',
    'https://sluzby.bazos.sk/',
    'https://ostatne.bazos.sk/',
    'https://vstupenky.bazos.sk/',
  ];
  return categories.filter(({ link }) => !blackList.includes(link));
};

const getPagination = (response: Response<any>) => {
  const { window } = new jsdom(response.body);
  const $ = window.document;
  const pagination = $.querySelector('.inzeratynadpis')?.textContent?.split(
    ' ',
  ) || [0];
  // next 2 lines is fucking shame, I know
  const isBigNumber = pagination[pagination.length - 2] !== 'z';
  const totalPosts = Number(
    `${isBigNumber ? pagination[pagination.length - 2] : ''}${
      pagination[pagination.length - 1]
    }`,
  );
  return {
    totalPages: Math.ceil(totalPosts / 20),
    perPage: 20,
  };
};

const getPostsData = (
  response: Response<any>,
  category: string,
  subCategory: string,
) => {
  const { window } = new jsdom(response.body);
  const $ = window.document;
  return Array.from<Element>($.querySelectorAll('.inzeraty')).map((e) => {
    const postName = e.querySelector('h2')?.textContent || '';
    const postViews =
      e.querySelector('.inzeratyview')?.textContent?.split(' ') || '';
    return {
      name: postName,
      views: postViews[0],
      category,
      subCategory,
    };
  });
};

const bazosCrawler = async () => {
  const mainPage = await got.get('https://www.bazos.sk/');
  const categories = cutNotInterestingCategories(
    getLinksList(mainPage, '.nadpisnahlavni a'),
  );
  // console.log(categories)
  const catsTree: { [key: string]: Category[] } = {};

  await new Promise<void>((resolve) => {
    categories.forEach(async (cat, i) => {
      try {
        const categoryPage = await got.get(cat.link);
        const subCategories = getLinksList(categoryPage, '.barvaleva a');
        catsTree[cat.name] = subCategories
          .filter(({ link }) => link.startsWith('/'))
          .map(({ name, link }) => ({
            link: cat.link + link.slice(1),
            name,
          }));

        // console.log(cat.name, catsTree[cat.name])

        if (i === categories.length - 1) {
          resolve();
        }
      } catch (e) {
        console.log('ERROR in step 2', e);
        return;
      }
    });
  });

  for await (const [catName, subcategories] of [
    Object.entries(catsTree)[0],
    Object.entries(catsTree)[1],
  ]) {
    const devSubCats = [subcategories[0], subcategories[1]];

    for await (const { name: subCatName, link } of devSubCats) {
      const firstPage = await got.get(`${link}?order=3`);
      // getPostsData(firstPage)
      const pagination = getPagination(firstPage);
      const devPagination = { totalPages: 2, perPage: 20 };
      const subCatFullName = `${catName}/${subCatName}`;

      const offsets = Array(devPagination.totalPages)
        .fill(null)
        .map((_, i) => (i + 1) * devPagination.perPage);
      for await (const offset of offsets) {
        const page = await got.get(`${link}${offset}/?order=3`);
        Product.insertMany(getPostsData(page, catName, subCatName))
          .then(function () {
            console.log('Data inserted'); // Success
          })
          .catch(function (error) {
            console.log(error); // Failure
          });
      }
    }
  }
};

bazosCrawler();
