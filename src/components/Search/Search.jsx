import "./Search.css";

function Search({ searchTerm, setSearchTerm, onSearch, isSearching, onReset }) {
    return (
        <div className="search-wrapper">
            <input
                type="text"
                placeholder="Search Pokémon by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                id="pokemon-name-search"
            />
            <button onClick={onSearch}>Search</button>
            {isSearching && <button onClick={onReset}>Reset</button>}
        </div>
    );
}

export default Search;
