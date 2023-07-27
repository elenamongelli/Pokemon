const { calculateBMI, getAllPokemon } = require('./pokemon');

describe('Pokemon Attributes', () => {
  test('calculates BMI correctly', () => {
    expect(calculateBMI(750, 150)).toBe(0.333);
  });

  test('fetches all Pokemon', async () => {
    jest.mock('node-fetch', () => ({
      default: jest.fn(() =>
        Promise.resolve({
          json: () => ({
            results: [
              {
                id: 1,
                name: 'Bulbasaur',
                baseExperience: 64,
                height: 7,
                weight: 69,
                pokedexOrder: 1,
                spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
                typeSlot1: 'grass',
                typeSlot2: 'poison',
                versions: ['red', 'blue', 'leafgreen', 'white'],
              },
              {
                id: 2,
                name: "Ivysaur",
                baseExperience: 142,
                height: 10,
                weight: 130,
                pokedexOrder: 2,
                bodyMassIndex: 13,
                spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png",
                typeSlot1: "grass",
                typeSlot2: "poison",
                versions: ['red', 'blue', 'leafgreen', 'white'],
              }
            ],
          }),
        })
      ),
    }));

    const allPokemon = await getAllPokemon();
    expect(Array.isArray(allPokemon)).toBe(true);
    expect(allPokemon.length).toBeGreaterThan(0);
  });
});
