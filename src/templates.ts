// ---- NUMBER OF DUPLICATES

// const duplicatedProducts = await Product.aggregate([
//   { $match: { crawlerDate } },
//   { $group: {
//     _id: { id: "$id", category: "$category", subCategory: "$subCategory", name: "$name", views: "$views" },
//     count: { "$sum": 1 }
//   }},
//   { $match: { "count": { "$gt": 1 }}},
//   // { $group: { _id: null, allDuplicated: { $sum: "$count" } }},
//   // { $limit: 10 }
// ])
// console.log(allProducts.length, duplicatedProducts.length)



// ------- PROMOTED PERCENT

// const toppedAll = allProducts.filter(({ isPromoted }) => isPromoted).length;
// const notToppedAll = allProducts.length - toppedAll;
// console.log(allProducts.length, toppedAll, notToppedAll, (toppedAll / (allProducts.length / 100)).toFixed(2))
//


// -------- COLLECTION MAP

// const allProducts2Map = new Map();
// allProducts2.forEach(({ id }) => allProducts2Map.set(id, ""))



// --------- COLLECTION DIFFERENCES

// const newProducts = allProducts2.filter(({ id }) => {
//   return !allProductsMap.has(id)
// });
// console.log(allProducts.length, allProducts2.length, newProducts.length)
// const missingProducts = allProducts.filter(({ id }) => {
//   return !allProducts2Map.has(id)
// });
// console.log(allProducts.length, allProducts2.length, missingProducts.length)
// console.log(missingProducts.length, topped, notTopped, (topped / (missingProducts.length / 100)).toFixed(2))


// --------- KIND OF SPLIT BY CATEGORY

// const getProductsByCategory = (rows: IProduct[]) => {
//   // @ts-ignore
//   const mappedCategoryNames = rows.map(({ category, subCategory, count }) => ({ cat: `${category}/${subCategory}`, count }));
//   return mappedCategoryNames.reduce((accum, current) => {
//     if (current.cat in accum) {
//       // @ts-ignore
//       accum[current.cat] += current.count || 1;
//       // @ts-ignore
//       // console.log(current.cat, accum[current.cat], current.count)
//       return accum
//     }
//     // @ts-ignore
//     accum[current.cat] = 0
//     return accum
//   }, {})
// }
//
// const allInCats = stats[0].subCategories;
// const allProductsByCategory = getProductsByCategory(allProducts);
// const dublicatesByCategory = getProductsByCategory(duplicatedProducts.map(({ _id, count }) => ({ ..._id, count })));
// const uniqFromDublicatesByCategory = getProductsByCategory(duplicatedProducts.map(({ _id }) => _id));
// Object.keys(dublicatesByCategory).forEach((key) => {
//   const stat = allInCats[key];
//   // @ts-ignore
//   const all = allProductsByCategory[key];
//   // @ts-ignore
//   const dublicates = dublicatesByCategory[key];
//   // @ts-ignore
//   const uniqFromDublicates = uniqFromDublicatesByCategory[key];
//   console.log(key, stat, all, dublicates, uniqFromDublicates, (dublicates / (stat / 100)).toFixed(2), (dublicates / (all / 100)).toFixed(2));
// })


// -------- MISSING PRODUCTS BY DATE

// const missingProductDates = missingProducts.reduce((accum, current) => {
//   if (current.productDate in accum) {
//     accum[current.productDate]++
//     return accum
//   }
//   accum[current.productDate] = 1;
//   return accum
// }, {})
// console.log(missingProductDates)
