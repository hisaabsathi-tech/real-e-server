// Register module aliases
import moduleAlias from 'module-alias';

// Register the @ alias to point to the project root
moduleAlias.addAliases({
  '@': __dirname + '/..'
});
