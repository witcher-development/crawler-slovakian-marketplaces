import got, { Response } from 'got';
import * as $jsdom from 'jsdom';

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

got.get('https://www.bazos.sk/').then((res) => {
  const categories = getLinksList(res, '.nadpisnahlavni a');

  const catsTree: { [key: string]: Category[] } = {};

  categories.forEach((cat, i) => {
    got.get(cat.link).then((res) => {
      const subCategories = getLinksList(res, '.barvaleva a');
      catsTree[cat.name] = subCategories
        .filter(({ link }) => link.startsWith('/'))
        .map(({ name, link }) => ({
          link: cat.link + link.slice(1),
          name,
        }));

      if (i === categories.length - 1) {
        console.log(catsTree);
      }
    });
  });
});
