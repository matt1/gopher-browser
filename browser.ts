import {GuiServer} from './gui_server.ts';

const server = new GuiServer();

// Serve forever
server.serve();