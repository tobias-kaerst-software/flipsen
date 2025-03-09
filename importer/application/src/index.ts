import { Command } from 'commander';

import { openaiCommands } from '$/commands/openai';
import { tmdbCommands } from '$/commands/tmdb';

const program = new Command();

program
  .name('tmdb-importer-tool')
  .description('CLI to download and process TMDB data.')
  .version('0.0.0')
  .addCommand(tmdbCommands)
  .addCommand(openaiCommands);

if (process.argv.length === 2) {
  process.argv.push('-h');
}

program.parse();

/*
const facet = createSearchMovieViewFacet({ movieDir: '/home/devtobias/data/flipsen/movies' });
const res = await facet.generateItem('950396');
// console.log(res);

if (!res.data) throw new Error('No data');

const client = new MongoClient('mongodb://localhost:27017', {
  auth: { username: 'root', password: 'root' },
});

client.on('commandStarted', (started) => console.log(started));
const collection = client.db('flipsen').collection('movies');

const _id = new ObjectId();
await collection.insertOne({ _id, ...res.data });

const state = facet.generateState(_id.toString(), res.data);
console.log(state);

await client.close();
*/
