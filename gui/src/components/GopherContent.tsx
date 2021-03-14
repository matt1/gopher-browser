import React, {Component} from 'react';
import {GopherItem} from './GopherItem';
import {GopherLink} from './GopherLink';
import {GopherDataUrlImage} from './GopherDataUrlImage';
import {GopherText} from './GopherText';
import {GopherSelector, GopherTabProps} from './GopherTab';
import './GopherContent.css';
import { GopherExternalLink } from './GopherExternalLink';
import {Markdown} from './Markdown';
import {GopherDownload} from './GopherDownload';
import { GopherSearch } from './GopherSearch';

/** This component is responsible for "rendering" the gopher content. */
export class GopherContent extends Component<GopherTabProps, {}> {  
  /** Cache last position we were told to scroll to. */
  private lastScrollPos:number = 0;
  
  private scrollTimeout!:any;
  private scrollInterval: number = 500;

  /** Reference to content `div` - this allows us to manually scroll it etc. */
  contentRef:React.RefObject<HTMLElement>;
  
  constructor(props:GopherTabProps) {
    super(props);
    this.lastScrollPos = this.props.scrollPos || 0;
    this.contentRef = React.createRef();
    this.onScroll = this.onScroll.bind(this);
  }

  onNavigate(selector:GopherSelector) {
    if (this.props.onNavigate) {
      this.props.onNavigate(selector);
    } else {
      throw new Error('No onNavigate function in props.');
    }
  }

  onStatus(status:string) {
    if (this.props.onStatus) this.props.onStatus(status);
  }

  onSearch(selector:GopherSelector) {
    if (this.props.onSearch) this.props.onSearch(selector);
  }

  onScroll() {
    if (!this.contentRef) return;
  
    // Debounce updates to prevent jank on big pages.
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      if (this.props.onScroll) this.props.onScroll(this.contentRef.current?.scrollTop || 0);
    }, 50);
    
  }

  componentDidUpdate() {    
    if ((this.props.scrollPos !== this.lastScrollPos) || (this.contentRef.current?.scrollTop !== this.lastScrollPos)) {
      this.lastScrollPos = this.props.scrollPos || 0;
      this.contentRef.current?.scrollTo({top: this.lastScrollPos});
    }
  }

  render() {
    const items = [];
    let line = 0;
    let props:GopherTabProps;
   
    // Switch on the type of the selector that was requested
    if (!this.props.selector) {
      console.error('No active selector?');
      return '';
    }

    if (!this.props.bytes) {
      throw new Error(`Zero-length payload for selector ${this.props.selector}`);
    }

    // Switch on the content type that was requested - this might be an image or
    // a download etc, or might be another Gopher Menu (that itself contains
    // various items of different type);
    const contentType = this.props.selector.type
    switch(contentType) {
      case '1': // Menu - handle each item in the menu appropriate.        

        const menuString = new TextDecoder().decode(this.props.bytes);
        if (!menuString) {
          // We zero out the `bytes` payload on navigate to clear the old page,
          // so just return a blank response here.
          return '';
        }

        const menu = JSON.parse(menuString);
        
        for (const item of menu.items) {
          item.key = (line++).toString();
          let elem;
          switch (item.type) {
            case 'h': // external hyperlink
              elem = React.createElement(GopherExternalLink, item, null);
              break;
            case 'i': // info line
              elem = React.createElement(GopherItem, item, null);
              break;
            case '7': // search field
              item.onSearch = (selector:GopherSelector) => this.onSearch(selector);
              elem = React.createElement(GopherSearch, item, null);
              break;
            default: // assume a link to some other resource
              item.onNavigate = (selector:GopherSelector) => this.onNavigate(selector);
              item.onStatus = (status:string) => this.onStatus(status);
              elem = React.createElement(GopherLink, item, null);
              break;
          }
          
          items.push(elem);
        }
        break;
      case '0': // text
        props = {...this.props};
        props.key = 'text';
        if(this.props.selector.selector?.endsWith('.md')) {
          items.push(React.createElement(Markdown, props, null));
        } else {
          items.push(React.createElement(GopherText, props, null));
        }
        break;
      case 'g': // images
      case 'I':
      case 'p':
        props = {...this.props};
        props.key = 'base64';
        items.push(React.createElement(GopherDataUrlImage, props, null));
        break;
      case '9': // binary download
        props = {...this.props};
        props.key = 'download';
        items.push(React.createElement(GopherDownload, props, null));
        break;
      default:
        console.warn(`Unhandled content type ${this.props.selector.type}`);
    }

    return React.createElement('div', {
      ref: this.contentRef,
      onScroll: this.onScroll,
      className: 'gopherContent',
    }, items);
  }
}