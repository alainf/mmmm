# Readme

Install it:
```
git clone https://github.com/alclro/mmmm.git
cd mmmm
```

If you don't already have it, install yarn, an npm alternative:
```
npm install yarn -g
```

Why yarn? Two npm installs of the same package might not install
the same files in the same places, whereas yarn is designed to be reproducible.

If you're already familiar with npm, have a look at this
[yarn-npm cheat sheet](https://github.com/areai51/yarn-cheatsheet).

Install dependencies:
```
yarn
```

## UPDATE 2012-12-27
```
yarn run diagram
```

Et pointez votre fureteur sur <http://localhost:1234/diagram.html>
pour voir le document [/info/diagram.html](./info/diagram.html)
en action.


Start it for development, editing files will reload the server:
```
yarn run dev
```

Start it for production, templates are cached:
```
yarn start
```

Launch the browser:
```
firefox http://localhost:8090/
```

What other scripts are available?
```
yarn run
```

See the file ```package.json``` for each script implementation.

To run all tests, linters, etc.
```
yarn run test
```

# mmmm
Expérimentation en vue d'apprendre à faire des sites.
