import React, {Component} from 'react';
import {GopherTabProps} from './GopherTab';


/** 
 * This component is responsible for dispalying an image via a Base64 encoded
 * data URL.
 */
export class GopherDataUrlImage extends Component<GopherTabProps, {}> {
  static decoder = new TextDecoder();

  decode() {
    if (!this.props.bytes) throw new Error('No image data to render.');
    return window.URL.createObjectURL(new Blob([this.props.bytes]));
  }

  render() {
    return (
      <img alt="" src={this.decode()}/>
    );
  }
}