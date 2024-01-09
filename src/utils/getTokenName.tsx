type TokenDictionary = {
  [key: string]: string;
};

const tokenDictionary: TokenDictionary = {
  "0xefa725a5df23b6836ee9660af6477d664bb0818b": "DT",
  "0x9bca8ac4e7ae4868a19ff7d9ec75524f0078297e": "FUSDT",
  "0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f": "FDAIX",
};
export default function getTokenName(address: string): string | undefined {
  if (!address) {
    return;
  }
  const lowercaseAddress = address.toLowerCase();
  return tokenDictionary[lowercaseAddress];
}
