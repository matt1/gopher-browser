import React, {Component} from 'react';
import './GopherItem.css';
import { GopherSelector } from './GopherTab';


/** This component is responsible for "rendering" a single Gopher item. */
export class GopherItem extends Component<GopherSelector, {}> {
  generateClassNames(root:string) {
    return `${root} ${this.props!.type}`;
  }

  render() {
    return (
      <div className="gopherItem">
        <div className={this.generateClassNames('type')}>{this.props.type}</div>
        <div className={this.generateClassNames('name')}>{this.props.name}</div>
      </div>
    );
  }
}