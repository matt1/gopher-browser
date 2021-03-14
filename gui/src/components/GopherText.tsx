import React, {Component} from 'react';
import {GopherTabProps} from './GopherTab';

/** 
 * This component is responsible for dispalying text files.
 */
export class GopherText extends Component<GopherTabProps, {}> {
  
  private static decoder = new TextDecoder();

  decode():string {
    return GopherText.decoder.decode(this.props.bytes);
  }
  
  render() {
    return (
      <pre className="gopherText">{this.decode()}</pre>
    );
  }
}