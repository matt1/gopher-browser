import React, {Component} from 'react';
import './GopherItem.css';
import { GopherSelector } from './GopherTab';


/** This component is responsible for an external link - e.g. to a HTTP URL. */
export class GopherExternalLink extends Component<GopherSelector, {}> {
  generateClassNames(root:string) {
    return `${root} ${this.props!.type}`;
  }

  generateExternalLink(selector:string):string {
    // Selectors will look like 'URL:http://example.com'
    return selector.substr(4);
  }

  render() {
    return (
      <div className="gopherItem gopherLink">
        <div className={this.generateClassNames('type')}>{this.props.type}</div>
        <a target="_blank" rel="noreferrer" href={this.generateExternalLink(this.props.selector!)} className={this.generateClassNames('name')}>{this.props.name}</a>
      </div>
    );
  }
}