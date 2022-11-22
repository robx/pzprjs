[![Translation status](https://hosted.weblate.org/widgets/pzprjs/en/svg-badge.svg)](https://hosted.weblate.org/engage/pzprjs/en/)
[![Translation status](https://hosted.weblate.org/widgets/pzprjs/ja/svg-badge.svg)](https://hosted.weblate.org/engage/pzprjs/ja/)

## About pzprjs

pzprjs enables one to create or edit pencil puzzles like
[sudoku] and [yajilin] which are solved with specific rules
on boards. It is developed using HTML5 features and JavaScript.

This project is a fork of the original [sabo2/pzprjs]; it is live on [puzz.link].

### Bugs, questions, contributions

Please file issues using the issue tracker if you run into any issues with pzprjs.
Or write to `feedback at puzz.link`, or join
[puzzlink.zulipchat.com](https://puzzlink.zulipchat.com) to discuss.

### Translation

Translations can be contributed using [Weblate](https://hosted.weblate.org/engage/pzprjs/) (no account required).

### Repository structure

The core of the puzzle solving and editing applet lives in `src/`.
The list of puzzle types is in `src/pzpr/variety.js`, the implementation
of the various types within `src/variety/`. Tests for these types are
found in `test/script/` and `test/variety/`. The test cases in
`test/script/` are also used to generate instructions.

The web UI around the applet (buttons, options, background etc.) live
in `src-ui/`.


### Building and testing

Calling `make` will build the project to `dist/`. Depending on your browser's
security settings, you can interact with the result directly by opening
`dist/p.html` or `dist/list.html` in your browser. Otherwise, you may need
to run a web server, e.g. by running `python -m http.server` within `dist/`
and visiting `http://localhost:8000/list.html`.

Calling `make test` will run the unit tests.


### Adding a new puzzle type

Adding a puzzle type involves the following:

1. Define a new type in `src/pzpr/variety.js`. This could
   be a new base type `mytype` which will go in a new file
   `src/variety/mytype.js`, or be based on an existing type
   `oldtype`, in which case you'll edit `src/variety/oldtype.js`.
   (E.g., the type `aho` is defined in `shikaku.js`.)

2. Implement the type in that file in `src/variety/`. The parts
   of a type implementation are

    - Input event handling, by customising `MouseEvent` and `KeyEvent`.
      Every type has a number of "input modes",
      and typically one custom "auto" input mode.
    - Board customisation, by customising `Cell`, `Board` etc.
    - Rendering, by customising `Graphic`.
    - URL and file encoding, by customising `Encode` and `FileIO`.
      `Encode` is used to deal with pzpr URLs, while `FileIO` is
      used when you save a board state to file (see tests below).
    - Answer checks, by collecting names of checks in `AnsCheck.checklist`,
      implementing checking methods in `AnsCheck`, and defining
      failure codes and messages in `FailCode`.

   Have a look at existing types to see how multiple types within
   one file share code.

3. Add a test file for the new type in `test/script/mytype.js`.
   This must include a full suite of example boards that trigger
   the various fail codes one by one. Ideally, this would be one
   example puzzle that shows various errors, but it's fine to
   deviate from that. The boards are stored as strings as generated
   by "File -> Save file as...", with newlines replaced by slashes.

   Furthermore, if your type does any tricky input handling, it's
   a good idea to add some input scripts in the `inputs` section
   of this test file.

4. Add the new type to the web UI by adding it to each of
   `src-ui/js/v3index.js` and `src-ui/list.html`.

5. Add a background tile as `src-ui/img/mytype.png` and
   add the type in `src-ui/js/ui/Misc.js:toBGimage`.

6. Add a line to `Changelog.md`.


Steps 1 and 2 should be enough to be able to interact with the
type by visiting `p.html?mytype`. Feel free to skip steps 5 and 6
when submitting a pull request for a new type.


### Glossary

There are some Japanese terms in the source code that may not be obvious.

irowake: per-component coloring
peke: cross mark


[sabo2/pzprjs]: https://github.com/sabo2/pzprjs
[puzz.link]: https://puzz.link/list.html
[sudoku]: https://en.wikipedia.org/wiki/Sudoku
[yajilin]: https://en.wikipedia.org/wiki/Yajilin
