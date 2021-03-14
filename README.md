Gopher Browser
==============

A very-experimental browser for Gopher protocol with basic support for Gopher+,
Gopher-over-TLS, and Markdown. Although largely usable, it is still very-much
at an early-alpha level of quality & reliability and so is not ready for active
use by users. There is also significant refactoring that can be done to improve
the code readability & extensibility.

The general architecture is that there is a small Deno HTTP server that runs as
a backend offering a basic API for interacting with Gopher servers. There is
then a React-based GUI app that communicates with this backend and renders the
output. The React GUI can be run directly in a browser for local development, or
run in a "webview" for a native-style desktop experience:

- `browser.ts` Sets up a normal HTTP server for local testing of the GUI.
- `webview.ts` Sets up a `webview` and displays the GUI through that.
- `/gui_server.ts` Handles requests from the `webview` (...or browser...) for rendering the GUI.
- `/gopher.ts` Handles interactions with the Gopher protocol client.
- `/gui` Contains a React-based web app that is rendered inside a `webview`.

The bulk of the logic and complexity is within this React GUI. Yes - the irony
of a javascript-heavy React webapp that acts as a Gopher browser is recognised.

## Development workflow

During development the 'best' way to work is to run the React GUI direclty in
the browser, and then also run the GUI-server simultanesouly to serve API calls.

This will allow the GUI to make requests to the API endpoints in the GUI-server
while still allowing for a fast edit-reload cycle for the GUI. It also has the
benefit of doing real Gopher requests (from the GUI-server) and you can use all
the usual browser-based dev tools (e.g. React extension etc).

```bash
# Run the GUI-server to handle API calls:
deno run -Ar browser.ts --watch

# Simultaneously run the GUI which can be viewed in a browser:
cd gui
npm start
```

Eventually, we should provide a way to mock out the GUI-server entirely.

## GUI

This was created with Create React App - see README in `/gui` for more details.

To run locally in a browser during development
```
cd gui
npm start
```

To actually have some files to be served from the built-in HTTP server,
you need to run `npm run build` to generate the assets in the `gui/build` dir.