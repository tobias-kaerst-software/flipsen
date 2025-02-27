import { Command } from 'commander';

import { dailyExportsCommand } from '$/commands/download/subcommands/exports';
import { moviesCommand } from '$/commands/download/subcommands/movies';

export const downloadCommand = new Command()
  .command('download')
  .addCommand(dailyExportsCommand)
  .addCommand(moviesCommand);
