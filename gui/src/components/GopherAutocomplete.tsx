import React, {ChangeEvent, Component} from 'react';
import './GopherAutocomplete.css';
import { GopherSelector, HistoryFrame } from './GopherTab';
import { Suggestion, SuggestionType } from './NavigationControls';


export class GopherAutocompleteState {
  activeSuggestion:number = 0;
  filteredSuggestions:Array<Suggestion> = [];
  showSuggestions:boolean = false;
  userInput:GopherSelector|undefined;
  uri:string|undefined = '';
}

export class GopherAutocompleteProps {
  onChange?: (event:ChangeEvent<HTMLInputElement>) => void;
  onNavigate?: (uri:string, type:string|undefined) => void;
  history?:Array<HistoryFrame>|undefined = [];
  suggestions?:Array<Suggestion>|undefined = [];
  uri:string|undefined = '';
}

/**
 * Autocomplete input for gopher address bar.
 * 
 * Based on https://www.digitalocean.com/community/tutorials/react-react-autocomplete
 */
export class GopherAutocomplete extends Component<GopherAutocompleteProps, GopherAutocompleteState>  {
  
  /** Reference for the main input box, so we can dynamically position suggestions. */
  inputRef:React.RefObject<HTMLInputElement>;

  private lastUri:string|undefined;

  constructor(props:GopherAutocompleteProps) {
    super(props);
    this.state = {
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: '',
      uri: '',
    };

    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.inputRef = React.createRef();
  }

  onChange(event:ChangeEvent<HTMLInputElement>){
    if (!event || !event.currentTarget) return;
    const userInput = (event.currentTarget as HTMLInputElement).value;
  
    let filteredSuggestions:Array<Suggestion> = [];
    
    if (this.props.suggestions) {
        filteredSuggestions = (this.props.suggestions.filter((suggestion:Suggestion) => 
          suggestion.selector!.toString().toLowerCase().indexOf(userInput.toLowerCase()) > -1
        ));
    }
  
    // TODO: only show search suggestion if not a valid gopher URI
    const queryTerm = new Suggestion();
    queryTerm.suggestionType = SuggestionType.SEARCH;
    queryTerm.query = userInput

    // Todo remove "duplicate" entries (might only happen in dev server hot reload?)
    filteredSuggestions = [queryTerm, ...filteredSuggestions];

    this.setState({
      activeSuggestion: 0,
      filteredSuggestions,
      showSuggestions: true,
      userInput: userInput,
      uri: userInput,
    });
  };

  onClick(event:React.MouseEvent) {
    const uri = (event.currentTarget.querySelector('.uri') as HTMLElement).innerText;
    const type = (event.currentTarget.querySelector('.uri') as HTMLElement).dataset['type'];
    this.setState({
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: uri,
    });
    this.onNavigate(uri, type);
  };

  onNavigate(uri:string, type:string|undefined) {
    if (!this.props.onNavigate) throw new Error('no onNavigate in props');
    this.setState({
      activeSuggestion: 0,
      showSuggestions: false,
    });
    this.props.onNavigate(uri, type);
  }

  onKeyDown(event:React.KeyboardEvent) {
    const { activeSuggestion, filteredSuggestions } = this.state;
  
    // enter
    if (event.keyCode === 13) {
      const selected = filteredSuggestions[activeSuggestion]?.toString() || this.state.userInput?.toString() || '';
      const type = filteredSuggestions[activeSuggestion]?.selector?.type || '1';
      this.setState({
        activeSuggestion: 0,
        showSuggestions: false,
        uri: selected,
      });
      this.onNavigate(selected, type);
      
    } else if (event.keyCode === 38) {
      if (activeSuggestion === 0) {
        return;
      }
      this.setState({ activeSuggestion: activeSuggestion - 1 });
    }
    // User pressed the down arrow, increment the index
    else if (event.keyCode === 40) {
      if (activeSuggestion - 1 === filteredSuggestions.length) {
        return;
      }
      this.setState({ activeSuggestion: activeSuggestion + 1 });
    }
    // escape
    else if (event.keyCode === 27) {
      this.setState({
        activeSuggestion: 0,
        showSuggestions: false,
      });
    }
  };

  render() {
    const {
      onChange,
      onClick,
      onKeyDown,
      state: {
        activeSuggestion,
        filteredSuggestions,
        showSuggestions,
        userInput
      }
    } = this;
    
    // compare the last URI we got from props - it will only be different from
    // our cahced copy if there is some sort of external navigation event.
    if (this.props.uri !== this.lastUri) {
      this.lastUri = this.props.uri;
      this.setState({
        activeSuggestion: 0,
        showSuggestions: false,
        uri: this.lastUri
      });
    }
  
    // dynamically calculate the position of the suggestions div. We need to do
    // this as it seems hard (impossible?) to have the absolute position suggestions
    // be the same size as the input, but also "float" over the page content.
    const input = this.inputRef.current;
    let top = `25px`; let left = `0px`; let width = `400px`;
    if (input) {
      top = `${input.clientTop + input.clientHeight}px`;
      left = `${input.offsetLeft}px`;
      width = `${input.clientWidth + 1.2}px`; // not sure where the 1.2 comes from
    }

    let suggestionsListComponent;
    if (showSuggestions && userInput) {
      if (filteredSuggestions.length) {
        suggestionsListComponent = (
          <div className='suggestions' style={{top, left, width}}>
            <ul className='suggestions'>
              {filteredSuggestions.map((suggestion, index) => {
                let className;
                if (index === activeSuggestion) {
                  className = 'suggestion-active';
                }
                let iconName;
                switch (suggestion.suggestionType) {
                  case SuggestionType.HISTORY:
                    iconName = 'history';
                    break;
                  case SuggestionType.SEARCH:
                    iconName = 'search';
                    break;
                  default:
                    iconName = 'language'; // a globe icon
                }

                return (
                  <li className={className} key={`${index}-${suggestion.toString()}`} onClick={onClick}>
                    <span className="material-icons">{iconName}</span>
                    <span className="uri" data-type={suggestion.selector?.type}>
                      {suggestion.toString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }
    }

    return (
      <div className="gopherAutocomplete">
        <input
          type='text'
          ref={this.inputRef}
          onChange={onChange}
          onClick={(event) => (event.target as HTMLInputElement).select()}
          onKeyDown={onKeyDown}
          placeholder='Search or enter gopher address'
          value={this.state.uri}
        />
        {suggestionsListComponent}
      </div>
    );
  }

}