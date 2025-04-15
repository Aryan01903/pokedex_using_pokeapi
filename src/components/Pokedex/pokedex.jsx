import Search from "../Search/Search"
import "../Pokedex/Pokedex.css"
import PokemonList from '../PokemonList/PokemonList';

function Pokedex(){
    return(
        <div className="pokedex-wrapper">
            <PokemonList/>
        </div>
    )
}

export default Pokedex;
