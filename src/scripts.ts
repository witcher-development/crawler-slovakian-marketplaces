import { isNumber } from 'underscore';
import { connect, disconnect, IProduct, Product, Stats } from './db.js';


const delay = (time = 5000) => new Promise((res) => {
  setTimeout(res, time)
})

let notNumbers = 0;
let all = 0;

const processNumbers = (products: { [key: string]: any }[], field: string) => {
  all += products.length;
  return products
    // @ts-ignore
    .map((p) => Number(p[field]))
    .filter((n) => {
      // @ts-ignore
      if (!isNumber(n) || isNaN(n)) {
        notNumbers++;
        return false
      }
      return true
    });
}

function median(products: { [key: string]: any }[], field: string) {
  const numbers = processNumbers(products, field);
  const sorted = Array.from(numbers).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle].toFixed(2);
}

const getMinMax = (products: IProduct[], field: string) => {
  const numbers = processNumbers(products, field);

  let min = Infinity;
  let max = -Infinity;

  for (const item of numbers) {
    if (item < min)
      min = item;

    if (item > max)
      max = item;
  }
  return {
    min,
    max,
  };
};

function percentOf(x: number, y: number) {
  return ((x / y) * 100).toFixed(2);
}

const getProductPostedDate = (date: string) => {
  const parts = date.replaceAll(" ", "").split(".")
  const dateObject = new Date()
  dateObject.setFullYear(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
  return dateObject
}

const getCrawlerRunDate = (iso: string) => {
  const date = new Date(iso);
  return `${date.getDate()}.${date.getMonth() + 1}`;
};

const formatPrice = (price: string) => {
  return price.replaceAll(" ", "").slice(0, -1)
}

const timespanBetweenDatesInDays = (productDate: string, crawlerDate: string) => {
  // @ts-ignore
  return (new Date(crawlerDate) - getProductPostedDate(productDate)) / (1000 * 3600 * 24)
}

const getProductsAge = (prod: IProduct[], crawlerDate: string) => {
  return prod.map(({ productDate }) => ({ time: timespanBetweenDatesInDays(productDate, crawlerDate) }));
}

const getProductsAgeInRanges = (productsAge: { time: number }[]) => {
  const timeRanges = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
  return timeRanges.reduce<{ [key: number]: any }>((accum, range, i) => {
    if (i === 0) {
      const count = productsAge.filter(({ time }) => time <= range).length
      accum[range] = {
        count,
        percent: percentOf(count, productsAge.length)
      };
      return accum
    }
    const count = accum[range] = productsAge.filter(({ time }) => timeRanges[i - 1] < time && time <= range).length;
    accum[range] = {
      count,
      percent: percentOf(count, productsAge.length)
    };
    return accum
  }, {})
}

// const dates = [
//   '2023-02-02T18:39:11.033Z',
//   '2023-02-04T00:08:12.848Z',
//   '2023-02-04T21:05:32.639Z',
//   '2023-02-06T10:36:08.995Z',
//   '2023-02-07T12:30:38.826Z',
//   '2023-02-08T11:50:32.352Z',
//   '2023-02-09T17:20:23.677Z',
// ];

const dates = [
  "2023-02-13T20:35:53.267Z",
  "2023-02-14T10:41:24.446Z"
]

const main = async () => {
  await connect();

  try {
    const getProductsForDate = async (date: string) => {
      return Product.aggregate([
        { $match: { crawlerDate: date }},
        // { $limit: 10 }
      ]);
    }
    // const allProducts = await Product.find();
    // const allProducts2 = await Product.aggregate([
    //   { $match: { crawlerDate: crawlerDate2 } },
    //   // { $limit: 10 }
    // ]);
    // const stats = await Stats.aggregate([
    //   { $match: { crawlerDate } },
    // ])

    const getMissingRows = (prod1: IProduct[], prod2: IProduct[]) => {
      const prod2Map = new Map();
      prod2.forEach(({ id }) => prod2Map.set(id, ''));

      return prod1.filter(({ id }) => {
        return !prod2Map.has(id);
      });
    };

    const getCollectionStats = (prod: IProduct[], prefix: string, crawlerDate?: string) => {
      const formattedPrice = prod.map(p => ({ ...p, price: formatPrice(p.price) }))
      const { min: min_price, max: max_price } = getMinMax(formattedPrice, 'price');
      const median_price = median(formattedPrice, 'price');

      const { min: min_views, max: max_views } = getMinMax(prod, 'views');
      const median_views = median(prod, 'views');

      const data: { [key: string]: any } = {
        count: prod.length,
        max_price,
        min_price,
        median_price,
        max_views,
        min_views,
        median_views,
        time_to_sell: crawlerDate ? median(getProductsAge(prod, crawlerDate), "time") : null,
      };

      return Object.keys(data).reduce(
        (accum: { [key: string]: number | null }, current) => {
          accum[`${prefix}_${current}`] = data[current];
          return accum;
        }, {});
    };

    const getCollectionSum = (prod: IProduct[], label: string, crawlerDate: string) => {
      const notTooOldProducts = prod.filter(({ productDate }) => true /* timespanBetweenDatesInDays(productDate, crawlerDate) < 54 */)
      const allStats = getCollectionStats(notTooOldProducts, "all", crawlerDate);

      const topped = notTooOldProducts.filter(({ isPromoted }) => isPromoted);
      const notTopped = notTooOldProducts.filter(({ isPromoted }) => !isPromoted);

      const toppedStats = getCollectionStats(topped, "prom", crawlerDate);
      const notToppedStats = getCollectionStats(notTopped, "free", crawlerDate);

      const toppedPercent = percentOf(topped.length, notTooOldProducts.length);

      return {
        label,
        ...allStats,
        ...toppedStats,
        ...notToppedStats,
        prom_percent: toppedPercent,
      }
    };

    const date1 = await getProductsForDate(dates[0]);
    const date2 = await getProductsForDate(dates[1]);
    const diff = getMissingRows(date1, date2);

    const results = [
      getCollectionSum(date1, getCrawlerRunDate(dates[0]), dates[0]),
      getCollectionSum(date2, getCrawlerRunDate(dates[1]), dates[1]),
      getCollectionSum(diff, "diff", dates[0]),
    ]

    console.table(results);

    const diffTimeToSell = getProductsAge(diff, dates[0])
    const diffPromTimeToSell = getProductsAge(diff.filter(({ isPromoted }) => isPromoted), dates[0])
    const diffFreeTimeToSell = getProductsAge(diff.filter(({ isPromoted }) => !isPromoted), dates[0])

    console.table(getProductsAgeInRanges(diffTimeToSell))
    console.table(getProductsAgeInRanges(diffPromTimeToSell))
    console.table(getProductsAgeInRanges(diffFreeTimeToSell))

    // console.log(notNumbers)
  } catch (e) {
    console.log(e);
  }

  disconnect();
};

main();
