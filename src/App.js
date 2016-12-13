import React, { Component } from 'react';
import logo from './logo.svg';
import ListItem from './components/ListItem';
import io from 'socket.io-client/socket.io'
import Loading from 'react-loading';
import aja from 'aja';
import './App.css';

class App extends Component {
  constructor(props){
    super();
    this.base_url = "http://192.168.33.10:3000";

    this.socket = io(this.base_url, {
      transports: ['websocket']
    });

    this.state = {
      search_term: '',
      pokemon_list:[],
      filtered_pokemon_list:[],
      is_loading:false
    };

    this.renderListItem = this.renderListItem.bind(this);
    this.renderNoResults = this.renderNoResults.bind(this);
    this.filterPokemonList = this.filterPokemonList.bind(this);
    this.getPokemonList = this.getPokemonList.bind(this);
    this.renderNoResults = this.renderNoResults.bind(this);
    this.searchPokemon = this.searchPokemon.bind(this);
    this.savePokemon = this.savePokemon.bind(this);

  }

  filterPokemonList(search_term, pokemon_list){
    let filtered_pokemon_list = pokemon_list.filter(()=>{
      if(pokemon.name.indexOf(search_term) !== -1){
        return pokemon;
      }
    })
    this.setState({filtered_pokemon_list});
  }

  getPokemonList(){
    console.log("GETTING LIST");
    aja().method('get').url(this.base_url + '/pokemon')
    .on('200', (pokemon_list) => {
      this.setState({
        pokemon_list:pokemon_list,
        filtered_pokemon_list:pokemon_list
      });
    })
    .go();
  }

  renderNoResults(){
    if(!this.state.filtered_pokemon_list.length){
      return(
        <div className={this.state.laoding ? 'no-result hidden' : 'no-result'}>
          Sorry I cannot find that Pokemon. Would you like to add it? <br/>
          <button onClick={this.savePokemon}>yes!</button>
        </div>
      );
    }
  }

  searchPokemon(e){
    let search_term = e.target.value.toLowerCase();
    this.setState({search_term});
    this.filterPokemonList.call(this, search_term, this.state.pokemon_list)
  }

  savePokemon(){
    this.setState({
      is_loading:true
    });
    if(this.state.search_term.trim() != ''){
      aja().method('post').url(this.base_url + '/save')
      .data({name:this.state.search_term})
      .on('200', (response) => {
        if(response.type == 'fail'){
          alert(response.msg);
        }
        //disable loading state
        this.setState({
          is_loading:false
        });
      })
    }
  }

  componentWillMount(){
    this.socket.on('pokedex_updated', (data) => {
      let pokemon_list = this.state.pokemon_list;
      if(data.old_val === null){
        pokemon_list.push(data.new_val);

        this.setState({
          pokemon_list:pokemon_list
        }, this.filterPokemonList.call(this, this.state.search_term, pokemon_list));
      }
    });
    this.getPokemonList();
  }

  renderListItem(pokemon){
    return(
      <ListItem pokemon={pokemon} key={pokemon.id} />
    );
  }


  render() {
    return (
      <div>
        <div id="header">
          <h1>RethinkReact Pokedex<h1>
          <input type="text" name="pokemon" id "pokemon" onChange={this.searchPokemon} placeholder="What kind of Pokemon are you?" />
        </div>
        <div className="pokemon-list flex">
        {this.state.filtered_pokemon_list.map(this.renderListItem)}
        </div>
        <div className={this.state.is_loading ? 'loader' : 'loader hidden'}>
          <Loading type="bubbles" color="#f93434" />
        </div>
        {this.renderNoResults}
      </div>
    );
  }
}

export default App;
