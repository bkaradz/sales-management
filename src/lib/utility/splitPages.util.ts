export const splitPage = (data: any[] | undefined, splitLength: number) => {
  if (!(Array.isArray(data))) throw new Error('Data not an Array');

  if (data.length <= splitLength) return [{data, pageNumber: 1}];

  let pageDataArray: any[] = [];
  let resultsArray: any[] = [];
  let splitLengthCount = 0;
  let pageNumber = 1;

  data.forEach((item) => {
    if (splitLengthCount >= splitLength) {
      splitLengthCount = 0;
      resultsArray.push({ data: pageDataArray, pageNumber });
      pageDataArray = [];
      pageNumber += 1;
    }
    pageDataArray.push(item);
    splitLengthCount += 1;
  });
  if (pageDataArray.length >= 1) resultsArray.push({data: pageDataArray, pageNumber});
  return resultsArray;
};