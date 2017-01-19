# gulp-html-partial
Gulp plugin for including HTML files into each other. Made for fun and my personal needs, but I'll appreciate if anyone will use it \\( ﾟヮﾟ)/ 

I know, there are some long-time solutions like [gulp-file-include](https://github.com/coderhaoxin/gulp-file-include), but I wanted to create something on my own with html-like syntax.

Supports nested partials and passing parameters as attributes.

# Requirements 
- [gulp](http://gulpjs.com/) (>=3.9.1) (guess it'll work with older versions too)
- [Node](http://nodejs.org/) (>=6.5.0) (not sure 4.x will handle all ES6 stuff)

# Installation
`npm install --save-dev gulp-html-partial`

# Usage

#### in HTML:
Files are included in `src` and `dist` directories.

**index.html:**
```html
<div class="container">
    <partial src="_1.html" title="Some title"></partial>
</div>
```

**_1.html:**
```html
<div>
    <div class="title">@@title</div>
    <span>Some span</span>
    <div>
        Some text
    </div>
</div>

<partial src="_2.html" param="Nested partial" dashed-param="Some-dashed-param"></partial>
<partial src="_3.html" param="I don't exist :("></partial>
```

**_2.html:**
```html
<div class="wtf">
    Some text
    <div class="header">@@param</div>
    <div class="block">@@dashed-param</div>
</div>
<p>Some text</p>
```

**Results in:**
```html
<div class="container">
    <div>
        <div class="title">Some title</div>
        <span>Some span</span>
        <div>Some text</div>
    </div>
    <div class="wtf">Some text
        <div class="header">Nested partial</div>
        <div class="block">Some-dashed-param</div>
    </div>
    <p>Some text</p>
</div>
```

#### in `gulpfile.js`:
```js
const gulp = require('gulp');
const htmlPartial = require('gulp-html-partial');

gulp.task('html', function () {
    gulp.src(['src/*.html'])
        .pipe(htmlPartial({
            basePath: 'src/partials/'
        }))
        .pipe(gulp.dest('build'));
});
```

# Options
```js
const defaults = {
        basePath: '',
        tagName: 'partial',
        variablePrefix: '@@'
    }
```

- `basePath` - base path for your partials, relative to `gulpfile.js`
- `tagName` - name of your partial tag, must have at least `src` attribute with path to partial file
- `variablePrefix` - prefix of variable keys passed as attributes into partials
 

# Notes
- missing partials defaults to empty string
- errors fire as logs, not as events, to make sure every, not only the first one, missing partial will be described - but I guess there is a way to make that work with events too
