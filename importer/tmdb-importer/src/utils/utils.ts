import PQueue from 'p-queue';

export const promisesWithProgress = async <T>(promises: Promise<T>[], concurrency = 5) => {
  const queue = new PQueue({ concurrency });

  let progress = 0;

  queue.on('completed', () => {
    const percent = Math.round((progress++ / promises.length) * 100);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`DEBUG: Processing at ${percent}%`);
  });

  queue.addAll(promises.map((promise) => () => promise));

  const results = new Promise((resolve) => {
    queue.onIdle().then((val) => {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      resolve(val);
    });
  });

  await results;
  return await Promise.all(promises);
};
