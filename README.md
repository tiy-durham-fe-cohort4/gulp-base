# gulp-base

A base setup for gulp (to be updated as we go along)

Use it as a reference, or copy it to jump-start a gulp project.

## Getting set up

- Clone this project:
  - `git clone git@github.com:tiy-durham-fe-cohort4/gulp-base.git your-project-name`
  - `cd your-project-name`
  - `rm -rf .git`
  - `git init`
- Update `package.json`
  - You can do this by running `npm init` or by editing `package.json` directly.
  - Change the package name
  - Change the package description
- Check things in
  - `git add .`
  - `git commit -m "Initial checkin"`
- Install dependencies
  - `npm install`

You should be all set at this point!

## Building an app

This gulp configuration uses: 

- Browserify to bundle your source
  - Includes jQuery, underscore, backbone, and parsley
  - `init.js` is currently the entry-point for your app
- SCSS to manage CSS dependencies and such
- Any `.html` files found in the `views` folder will be bundled
  - Available via `require('views')`