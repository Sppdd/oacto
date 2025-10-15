const gulp = require('gulp');

// Simple task to copy icon files (placeholder)
gulp.task('build:icons', function() {
  console.log('Icons task completed (no icons to build)');
  return Promise.resolve();
});

// Default task
gulp.task('default', gulp.series('build:icons'));
