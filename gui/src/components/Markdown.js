import React, {Component} from 'react';
import ReactMarkdown from 'react-markdown'

/** 
 * This component is responsible for dispalying markdown files. N.B.
 * this is a plain javascript file as ReactMarkdown's types are broken and
 * typescript will not compile.
 */
export class Markdown extends Component {
  static decoder = new TextDecoder();

  decode() {
    return Markdown.decoder.decode(this.props.bytes);
  }

  render() {
    return (
      <ReactMarkdown>{this.decode()}</ReactMarkdown>
    );
  }
}