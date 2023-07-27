const fs = require('fs').promises;

const getAllPokemon = async () => {
  let allPokemon = [];

  try {
    let nextUrl = 'https://pokeapi.co/api/v2/pokemon';

    do { //the API returns 20 pokemon per call
      const response = await fetch(nextUrl);
      //results: array of pokemon data, next: url for next batch -> https://pokeapi.co/api/v2/pokemon?limit=${batchSize}&offset=${offset}
      const { results, next } = await response.json();
      
      allPokemon.push(...results);
      nextUrl = next;
    } while (nextUrl)
  } catch (error) {
    console.error('Error fetching Pokemon data:', error);
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

    const isAllowedVersion = (gameIndex) => ['red', 'blue', 'leafgreen', 'white'].includes(gameIndex.version.name);
    
    const allowedPokemon = pokemonDataList.filter((pokemonData) =>
      pokemonData.game_indices.some(isAllowedVersion)
    );
    const allPokemonData = allowedPokemon.map((pokemonData) => {
      const typeSlot1 = pokemonData.types.find((type) => type.slot === 1)?.type.name;
      const typeSlot2 = pokemonData.types.find((type) => type.slot === 2)?.type.name || null;
      const version = pokemonData.game_indices.filter(isAllowedVersion).map((gameIndex) => gameIndex.version.name);

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
        versions: version,
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

const calculateBMI = (weight, height) => {
  const heightInMeters = height / 10; // from decimetres to meters
  const weightInKilograms = weight / 10; // from hectograms to kilograms
  return +(weightInKilograms / (heightInMeters * heightInMeters)).toFixed(3);
};

module.exports = {
  calculateBMI,
  getAllPokemon,
};