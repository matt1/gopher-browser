// Imports deno http libraries.
import {serve, Server, ServerRequest} from "https://deno.land/std/http/server.ts";
import {Gopher} from './gopher.ts';

export const PORT = 7070;

/** A HTTP server to deliver the GUI to the webview (or browser). */
export class GuiServer {

  readonly gopher: Gopher;
  readonly server: Server;

	constructor() {
    this.gopher = new Gopher();
    this.server = serve({port:PORT});    
  }

  private async serveApi(request:ServerRequest) {
    const body = await Deno.readAll(request.body);
    const payload = JSON.parse(new TextDecoder().decode(body));
    console.log(`-> API Request - ${request.url}: ${payload.hostname}:${payload.port}${payload.selector} (type: ${payload.type})`);

    if (!payload.hostname) {
      request.respond({status: 400, body: 'missing hostname'});
      return;
    }

    const headers = new Headers();
    headers.append("access-control-allow-origin", "*");
    headers.append(
      "access-control-allow-headers",
      "Origin, X-Requested-With, Content-Type, Accept, Range",
    );
    
    try {
      if (request.url.indexOf('/api/v1/downloadMenu') > -1) {
        const data = await this.gopher.loadMenu(payload.hostname, Number.parseInt(payload.port), payload.selector);
        // TODO: send metadata in headers  
        request.respond({status: 200, headers: headers, body: data.bytes});
      } else if (request.url.indexOf('/api/v1/downloadItem') > -1) {
        const data = await this.gopher.loadItem(payload.hostname, Number.parseInt(payload.port), payload.selector);
        // TODO: send metadata in headers
        request.respond({status: 200, headers: headers, body: data.bytes});
      } else if (request.url.indexOf('/api/v1/search') > -1) {
        const data = await this.gopher.search(payload.hostname, Number.parseInt(payload.port), payload.selector, payload.query);
        // TODO: send metadata in headers
        request.respond({status: 200, headers: headers, body: data.bytes});
      } else {
        request.respond({status: 400, headers: headers, body: 'unrecognised method'});
      }
    } catch (error) {
      console.warn(`Error downloading from Gopher - sending 500: ${error}`);
      request.respond({status: 500, headers: headers, body: `${error}`});
    }
  }

  async serve() {
    console.log(`Starting server on :${PORT}`);

    while (true) {
      try {
        for await (const request of this.server) {
          let file = request.url;
          if (request.method === "POST") {
            if (request.url.indexOf('/api/') > -1) {
              this.serveApi(request);
            }
          } else if (request.method === "GET") {
            try {
              if (request.url === '/') file = '/index.html';
              let path = `./gui/build${file}`;
              request.respond({status: 200, body: await Deno.readFile(path)});        
            } catch (e){
              request.respond({status: 400, body: `400 Bad Request: ${e}`});
            }
          }
        }
      } catch (error) {
        console.warn(error);
      }
    }
  }
}