import { Command } from 'commander';

import { movieEmbeddingsCommand } from '$/commands/embeddings/subcommands/movies';

export const embeddingCommands = new Command().command('embeddings').addCommand(movieEmbeddingsCommand);
