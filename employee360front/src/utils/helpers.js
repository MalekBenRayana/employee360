export const groupBy = (array, key) => {
    return Object.values(array.reduce((result, currentValue) => {
      const groupKey = typeof key === 'function' ? key(currentValue) : currentValue[key];
      if (!result[groupKey]) {
        result[groupKey] = { key: groupKey, values: [] };
      }
      result[groupKey].values.push(currentValue);
      return result; // Return the accumulator object here
    }, {})); // Initialize the accumulator as an empty object
  };