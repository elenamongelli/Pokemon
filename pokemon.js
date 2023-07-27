const fs = require('fs').promises;

const calculateBMI = (weight, height) => {
  const heightInMeters = height / 10; // from decimetres to meters
  const weightInKilograms = weight / 10; // from hectograms to kilograms
  return +(weightInKilograms / (heightInMeters * heightInMeters)).toFixed(3);
};
  const getAllPokemon = async () => {
    const cacheFilePath = 'pokemon_cache.json';
    let allPokemon = [];
  
    try {
      // Check if the cache file exists
      const cacheData = await fs.readFile(cacheFilePath, 'utf8');
      allPokemon = JSON.parse(cacheData);
      console.log('Data loaded from cache.');
    } catch (error) {
      console.log('Cache file not found. Fetching data from the API...');
    }
  
    if (allPokemon.length === 0) {
      let offset = 0;
      const batchSize = 100;
  
      while (true) {
        try {
          const url = `https://pokeapi.co/api/v2/pokemon?limit=${batchSize}&offset=${offset}`;
          const response = await fetch(url);
          const { results, next } = await response.json();
  
          allPokemon.push(...results);
  
          if (!next) {
            // If there are no more results, break the loop
            break;
          }
  
          // Increment the offset for the next batch of data
          offset += batchSize;
        } catch (error) {
          console.error('Error fetching Pokemon data:', error);
          break;
        }
      }
  
      // Save the fetched data to the cache file
      const jsonData = JSON.stringify(allPokemon, null, 2);
      await fs.writeFile(cacheFilePath, jsonData, 'utf8');
      console.log('Data saved to cache.');
    }
  
    return allPokemon;
  };
  

(async () => {
  try {
    const allPokemon = await getAllPokemon();
    const pokemonDataPromises = allPokemon.map((pokemon) =>
      fetch(pokemon.url).then((response) => response.json())
    );

    const pokemonDataList = await Promise.all(pokemonDataPromises);

    // Filter Pokemon with game index version names "Red", "Blue," "LeafGreen," and "White"
    const redBlueLeafGreenWhitePokemon = pokemonDataList.filter((pokemonData) =>
      pokemonData.game_indices.some(
        (gameIndex) =>
          ['red', 'blue', 'leafgreen', 'white'].includes(gameIndex.version.name)
      )
    );

    const allPokemonData = redBlueLeafGreenWhitePokemon.map((pokemonData) => {
      const typeSlot1 = pokemonData.types.find((type) => type.slot === 1)?.type.name || null;
      const typeSlot2 = pokemonData.types.find((type) => type.slot === 2)?.type.name || null;

      return {
        id: pokemonData.id,
        name: pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1),
        baseExperience: pokemonData.base_experience,
        height: pokemonData.height,
        weight: pokemonData.weight,
        pokedexOrder: pokemonData.order,
        bodyMassIndex: calculateBMI(pokemonData.weight, pokemonData.height),
        spriteUrl: pokemonData.sprites.front_default,
        typeSlot1: typeSlot1,
        typeSlot2: typeSlot2,
        versions: pokemonData.game_indices
          .filter((gameIndex) => ['red', 'blue', 'leafgreen', 'white'].includes(gameIndex.version.name))
          .map((gameIndex) => gameIndex.version.name),
      };
    });

    console.log('All Pokemon Data:', allPokemonData);

    // Save the data to a JSON file
    const jsonData = JSON.stringify(allPokemonData, null, 2);
    await fs.writeFile('pokemon_data.json', jsonData, 'utf8');
    console.log('Data saved to pokemon_data.json');
  } catch (error) {
    console.error('Error fetching Pokemon data:', error);
  }
})();

module.exports = {
  calculateBMI,
  getAllPokemon,
};