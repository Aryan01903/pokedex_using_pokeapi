import { useEffect, useState } from "react";
import axios from "axios";
import Pokemon from "../Pokemon/Pokemon";
import Search from "../Search/Search";
import "./PokemonList.css";

function PokemonList() {
    const [pokemonListState, setPokemonListState] = useState({
        pokemonList: [],
        isLoading: true,
        pokedexUrl: "https://pokeapi.co/api/v2/pokemon",
        nextUrl: "",
        prevUrl: ""
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    async function downloadPokemons() {
        setPokemonListState((state) => ({
            ...state,
            isLoading: true
        }));

        const response = await axios.get(pokemonListState.pokedexUrl);
        const pokemonResults = response.data.results;

        setPokemonListState((state) => ({
            ...state,
            nextUrl: response.data.next,
            prevUrl: response.data.previous
        }));

        const pokemonResultPromise = pokemonResults.map((pokemon) =>
            axios.get(pokemon.url)
        );

        const pokemonData = await axios.all(pokemonResultPromise);

        const pokeListResult = pokemonData.map((pokeData) => {
            const pokemon = pokeData.data;
            return {
                id: pokemon.id,
                name: pokemon.name,
                image: pokemon.sprites.other.dream_world.front_default,
                types: pokemon.types
            };
        });

        setPokemonListState((state) => ({
            ...state,
            pokemonList: pokeListResult,
            isLoading: false
        }));
    }

    async function handleSearch() {
        if (!searchTerm) return;
        setPokemonListState((state) => ({
            ...state,
            isLoading: true
        }));
        setIsSearching(true);

        try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
            const pokemon = response.data;
            const searchResult = [{
                id: pokemon.id,
                name: pokemon.name,
                image: pokemon.sprites.other.dream_world.front_default,
                types: pokemon.types
            }];
            setPokemonListState((state) => ({
                ...state,
                pokemonList: searchResult,
                isLoading: false
            }));
        } catch (error) {
            alert("Pokémon not found!");
            setPokemonListState((state) => ({
                ...state,
                pokemonList: [],
                isLoading: false
            }));
        }
    }

    function resetSearch() {
        setSearchTerm("");
        setIsSearching(false);
        downloadPokemons();
    }

    useEffect(() => {
        if (!isSearching) {
            downloadPokemons();
        }
    }, [pokemonListState.pokedexUrl]);

    return (
        <div className="pokemon-list-wrapper">
            <Search
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearch={handleSearch}
                onReset={resetSearch}
                isSearching={isSearching}
            />

            <div className="pokemon-wrapper">
                {pokemonListState.isLoading
                    ? "Loading..."
                    : pokemonListState.pokemonList.map((p) => (
                        <Pokemon name={p.name} image={p.image} key={p.id} id={p.id} />
                    ))}
            </div>

            {!isSearching && (
                <div className="controls">
                    <button
                        disabled={!pokemonListState.prevUrl}
                        onClick={() => {
                            const urlToSet = pokemonListState.prevUrl;
                            setPokemonListState({ ...pokemonListState, pokedexUrl: urlToSet });
                        }}
                    >
                        Prev
                    </button>
                    <button
                        disabled={!pokemonListState.nextUrl}
                        onClick={() => {
                            const urlToSet = pokemonListState.nextUrl;
                            setPokemonListState({ ...pokemonListState, pokedexUrl: urlToSet });
                        }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default PokemonList;
