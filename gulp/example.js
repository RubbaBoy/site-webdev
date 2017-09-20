// Misc gulp tasks related to processing examples
'use strict';

module.exports = function (gulp, plugins, config) {

  const EXAMPLES_ROOT = config.EXAMPLES_ROOT;
  const argv = plugins.argv;
  const cp = plugins.child_process;
  const _exec = plugins.execSyncAndLog;
  const filter = plugins.filter;
  const gutil = plugins.gutil;
  const path = plugins.path;

  const chooseRegEx = argv.filter || '.';
  const skipRegEx = argv.skip || null;

  const findCmd = `find ${EXAMPLES_ROOT} -type f -name "pubspec.yaml" ! -path "*/.*"`;
  const findOutput = (cp.execSync(findCmd) + '').split(/\s+/).filter(p => p); // drop empty paths
  const examplesFullPath = findOutput.map(p => path.dirname(p))
    .filter(p => !p.match(skipRegEx))
    .filter(p => p.match(chooseRegEx));
  // const examples = examplesFullPath.map(p => path.basename(p));

  gulp.task('__list-example-paths', () => {
    gutil.log(`example paths:\n  ${examplesFullPath.join('\n  ')}`);
    gutil.log(`find output:\n[${findOutput}]`);
  });

  gulp.task('pub-upgrade-and-check', ['examples-pub-upgrade', 'ng-pkg-pub-upgrade'],
    () => plugins.gitCheckDiff());

  gulp.task('examples-pub-upgrade', () => examplesExec('pub upgrade'));

  // General exec task. Args: --exec='some-cmd with args'
  gulp.task('examples-exec', () => examplesExec(argv.exec));

  function examplesExec(cmd) {
    if (!cmd) throw `Invalid command: ${cmd}`;

    examplesFullPath.forEach((exPath) => {
      gutil.log(`\nExample: ${exPath}`);
      _exec(cmd, { cwd: exPath });
    });
  }

};
