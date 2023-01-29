import got from 'got';
import * as $jsdom from 'jsdom';

const jsdom = $jsdom.JSDOM;

got.get('https://mobil.bazos.sk/20/?order=3').then((res) => {
  const { window } = new jsdom(res.body);
  window.document
    .querySelectorAll('.inzeratycena b')
    .forEach((e) => console.log(e.textContent))
});

console.log('test');
