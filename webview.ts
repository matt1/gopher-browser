import {Gopher} from './gopher.ts';
import {GuiServer, PORT} from './gui_server.ts';
import {Webview} from "https://deno.land/x/webview/mod.ts";

const server = new GuiServer();
const webview = new Webview({url: `http://localhost:${PORT}`});
webview.run();

// Serve forever
server.serve();