const { program } = require('commander');

// version
program.version('1.0.0')

// options
program
  // 引数をとらない flgオプション
  .option('-d, --debug', 'output extra debugging')
  // 引数をとるオプション。default valueも指定可能(3rd args)
  .option('-s, --pizza-size <size>', 'S, M, or L', 'S')
  // 必須オプション。直観通り未指定の場合エラーに倒してくれる
  .requiredOption('-p, --pizza-type <type>', 'flavour of pizza');

program.parse(process.argv);

console.log(program.opts())
