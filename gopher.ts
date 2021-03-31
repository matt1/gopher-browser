import {GopherClient, GopherProtocol, TYPE_MENU} from "https://deno.land/x/gopher/mod.ts";


/** A response from the GopherServer. **/
export class GopherResponse {
  constructor(
    readonly bytes:Uint8Array,
    private readonly startTimeMillis:number,
    private readonly endTimeMillis:number) {
  }

  public get duration() : number {
    return this.endTimeMillis - this.startTimeMillis;
  }
}

/**
 * This class exists to handle interactions with the Gopher client library,
 * and provide responses to the gui in an appropriate format. It is largely
 * glue code.
 */
export class Gopher {

	private gopherClient:GopherClient;

	constructor() {
		this.gopherClient = new GopherClient({
			protocolVersion: GopherProtocol.RFC1436,
      tls: false,
		});
	}

	/** Load a Gopher menu and return results. */
	async loadMenu(hostname:string, port = 70, selector = ''): Promise<GopherResponse> {
		console.log(`Downloading menu from gopher: ${hostname} ${port} ${selector}`);
    let menu;
    const start = Date.now();
    try {
      menu = await this.gopherClient.downloadMenu({
        hostname,
        selector,
        port,
      });
    } catch (error) {
      console.warn(error);
      throw error;
    }

    return new GopherResponse(new TextEncoder().encode(JSON.stringify(menu)), start, Date.now());
	}

  /** 
   * Load a Gopher item (e.g. image etc) and return results. If it is an image
   * type then return the result as as a base64 encoded string for use in data
   * URL.
   */
  async loadItem(hostname:string, port = 70, selector = ''): Promise<GopherResponse> {
    console.log(`Downloading item from gopher: ${hostname} ${port} ${selector }`);
    
    const start = Date.now();
    const item = await this.gopherClient.downloadItem({
      hostname,
      selector,
      port,
    });

    return new GopherResponse(item.body, start, Date.now());

  }


  /** Query a gopher search server. */
  async search(hostname:string, port = 70, selector = '', query = ''): Promise<GopherResponse> {
    console.log(`Querying gopher: ${hostname} ${port} ${selector} ${query}`);
    let menu;
    const start = Date.now();
    try {
      menu = await this.gopherClient.search({
        hostname,
        selector,
        port,
        query,
      });
    } catch (error) {
      throw error;
    }

    return new GopherResponse(new TextEncoder().encode(JSON.stringify(menu)), start, Date.now());
  }

}