declare module "number-to-words" {
  const NumberToWords: {
    toWords: (n: number) => string;
    toWordsOrdinal: (n: number) => string;
  };
  export default NumberToWords;
}
