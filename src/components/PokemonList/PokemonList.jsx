import { useEffect, useState } from "react";
import axios from "axios";
import Pokemon from "../Pokemon/Pokemon";
import Search from "../Search/Search";
import "./PokemonList.css";

function PokemonList() {
    const [pokemonListState, setPokemonListState] = useState({
        pokemonList: [],
        isLoading: true,
        pokedexUrl: "https://pokeapi.co/api/v2/pokemon?limit=150",
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
            // First try searching by Pokémon name
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
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
            // If not found, try searching by type
            try {
                const typeResponse = await axios.get(`https://pokeapi.co/api/v2/type/${searchTerm.toLowerCase()}`);
                const pokemonOfType = typeResponse.data.pokemon;

                const limitedPokemon = pokemonOfType.slice(0, 20); // Limit to 20 for performance
                const pokemonDetailRequests = limitedPokemon.map(p =>
                    axios.get(p.pokemon.url)
                );

                const pokemonDetails = await axios.all(pokemonDetailRequests);
                const searchResult = pokemonDetails.map((pokeData) => {
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
                    pokemonList: searchResult,
                    isLoading: false
                }));
            } catch (typeError) {
                alert("Pokémon or type not found!");
                setPokemonListState((state) => ({
                    ...state,
                    pokemonList: [],
                    isLoading: false
                }));
            }
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
                    ? <p>Loading...</p>
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
