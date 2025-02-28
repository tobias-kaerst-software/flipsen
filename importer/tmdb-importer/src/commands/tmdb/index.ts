import { Command } from 'commander';

import { dailyExportsCommand } from '$/commands/tmdb/subcommands/exports';
import { moviesCommand } from '$/commands/tmdb/subcommands/movies';

export const tmdbCommands = new Command()
  .command('tmdb')
  .addCommand(dailyExportsCommand)
  .addCommand(moviesCommand);
