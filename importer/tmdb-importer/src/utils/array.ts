export const group = <T>(items: T[], size: number) => {
  return items.reduce<T[][]>((acc, season, i) => {
    if (i % size === 0) acc.push([]);
    acc[acc.length - 1].push(season);
    return acc;
  }, []);
};
