export const safeParse = (val, fallback) => {
  // checking if the data is already a json object  or not
  if (!val) return fallback;
  if (typeof val == "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};
