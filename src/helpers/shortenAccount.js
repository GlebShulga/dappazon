export const shortenAccount = (account) => {
  return `${account.substring(0, 6)}...${account.substring(
    account.length - 4
  )}`;
};
