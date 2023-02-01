import got, { Response } from 'got';
import * as $jsdom from 'jsdom';

import { Product, IProduct, Stats } from './db.js';

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

const getMainPageStats = (response: Response<any>) => {
  const { window } = new jsdom(response.body);
  const $ = window.document;
  const allProducts =
    $.querySelector('body > div.sirka > b:nth-child(22)')?.textContent || '';
  const newPerDay =
    $.querySelector('body > div.sirka > b:nth-child(23)')?.textContent || '';
  return {
    allProducts: Number(allProducts),
    newPerDay: Number(newPerDay),
    subCategories: {}
  };
};

const getSubCatStats = (response: Response<any>) => {
  const { window } = new jsdom(response.body);
  const $ = window.document;
  const allProducts =
    $.querySelector('.inzeratynadpis')
      ?.textContent?.split(' z ')[1]
      ?.replaceAll(' ', '') || '';
  return Number(allProducts);
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
): IProduct[] => {
  const { window } = new jsdom(response.body);
  const $ = window.document;
  return Array.from<Element>($.querySelectorAll('.inzeraty')).map((e) => {
    const name = e.querySelector('h2')?.textContent || '';
    const price = e.querySelector('.inzeratycena')?.textContent || '';
    const views =
      e.querySelector('.inzeratyview')?.textContent?.split(' ') || '';
    const id =
      e.querySelector<HTMLLinkElement>('.inzeratynadpis a')?.href.split('/') ||
      '';
    const badge = e.querySelector<HTMLLinkElement>('.ztop');
    const location = e.querySelector('.inzeratylok')?.textContent || '';
    const productDate =
      e
        .querySelector('.inzeratynadpis .velikost10')
        ?.textContent?.match(/\[([\s\S]*?)\]/) || '';
    return {
      name,
      price,
      views: Number(views[0]),
      category,
      subCategory,
      id: id[2],
      isPromoted: !!badge,
      location,
      productDate: productDate[1],
    };
  });
};

const insetProducts = (
  products: IProduct[],
  catName: string,
  subCatName: string,
  offset: number,
) => {
  Product.insertMany(products)
    .then(function () {
      console.log(
        `Data inserted - [${catName}] - [${subCatName}] - [${offset}]`,
      );
    })
    .catch(function (error) {
      console.log(
        `Data failed - [${catName}] - [${subCatName}] - [${offset}]`,
        products,
        error,
      );
    });
};

const bazosCrawler = async () => {
  const mainPage = await got.get('https://www.bazos.sk/');
  const categories = cutNotInterestingCategories(
    getLinksList(mainPage, '.nadpisnahlavni a'),
  );
  const catsTree: { [key: string]: Category[] } = {};
  const stats = getMainPageStats(mainPage);

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

  for await (const [catName, subcategories] of Object.entries(catsTree)) {
    const devSubCats = [subcategories[0], subcategories[1]];

    for await (const { name: subCatName, link } of devSubCats) {
      const firstPage = await got.get(`${link}?order=3`);
      const firstPageProducts = getPostsData(firstPage, catName, subCatName);
      // insetProducts(firstPageProducts, catName, subCatName, 0);
      const pagination = getPagination(firstPage);
      const devPagination = { totalPages: 5, perPage: 20 };

      // @ts-ignore
      stats.subCategories[`${catName}/${subCatName}`] = getSubCatStats(firstPage);

      const offsets = Array(devPagination.totalPages)
        .fill(null)
        .map((_, i) => (i + 1) * devPagination.perPage);
      // for await (const offset of offsets) {
      //   const page = await got.get(`${link}${offset}/?order=3`);
      //   const products = getPostsData(page, catName, subCatName);
      //   insetProducts(products, catName, subCatName, offset);
      // }
    }
  }

  console.log(stats)
  Stats.create(stats)
  // insert stats per day
};

// bazosCrawler();

Stats.find().then(console.log)
