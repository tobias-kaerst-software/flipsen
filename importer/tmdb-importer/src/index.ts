import { Command } from 'commander';

import { openaiCommands } from '$/commands/openai';
import { tmdbCommands } from '$/commands/tmdb';
import { getPersonDetails } from '$/features/tmdb/features/person';

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

// program.parse();

const person = await getPersonDetails('525');
Bun.write('person.json', JSON.stringify(person, null, 2));

// const collection = await getCollectionDetails('10');
// Bun.write('collection.json', JSON.stringify(collection, null, 2));

// const movie = await getMovieDetails('693134');
// Bun.write('movie.json', JSON.stringify(movie, null, 2));
