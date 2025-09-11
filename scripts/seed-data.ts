import { sqlite } from '../server/db';

async function seedDatabase() {
  console.log('Seeding database with sample data...');
  
  try {
    // Sample states
    const states = [
      { name: 'Uttar Pradesh', code: 'UP' },
      { name: 'Maharashtra', code: 'MH' },
      { name: 'Punjab', code: 'PB' },
      { name: 'Haryana', code: 'HR' },
      { name: 'Karnataka', code: 'KA' }
    ];

    console.log('Adding states...');
    for (const state of states) {
      const existing = sqlite.prepare('SELECT id FROM states WHERE code = ?').get(state.code);
      if (!existing) {
        sqlite.prepare('INSERT INTO states (name, code, created_at) VALUES (?, ?, ?)').run(
          state.name, state.code, Date.now()
        );
        console.log(`Added state: ${state.name}`);
      }
    }

    // Get state IDs for cities
    const stateIds = sqlite.prepare('SELECT id, name FROM states').all() as { id: number, name: string }[];
    
    // Sample cities
    const cities = [
      { name: 'Lucknow', stateName: 'Uttar Pradesh' },
      { name: 'Kanpur', stateName: 'Uttar Pradesh' },
      { name: 'Agra', stateName: 'Uttar Pradesh' },
      { name: 'Mumbai', stateName: 'Maharashtra' },
      { name: 'Pune', stateName: 'Maharashtra' },
      { name: 'Nagpur', stateName: 'Maharashtra' },
      { name: 'Amritsar', stateName: 'Punjab' },
      { name: 'Ludhiana', stateName: 'Punjab' },
      { name: 'Gurgaon', stateName: 'Haryana' },
      { name: 'Faridabad', stateName: 'Haryana' },
      { name: 'Bangalore', stateName: 'Karnataka' },
      { name: 'Mysore', stateName: 'Karnataka' }
    ];

    console.log('Adding cities...');
    for (const city of cities) {
      const state = stateIds.find(s => s.name === city.stateName);
      if (state) {
        const existing = sqlite.prepare('SELECT id FROM cities WHERE name = ? AND state_id = ?').get(city.name, state.id);
        if (!existing) {
          sqlite.prepare('INSERT INTO cities (name, state_id, created_at) VALUES (?, ?, ?)').run(
            city.name, state.id, Date.now()
          );
          console.log(`Added city: ${city.name}, ${city.stateName}`);
        }
      }
    }

    // Sample crops
    const crops = [
      { name: 'Wheat', unit: 'quintal', basePrice: 2500 },
      { name: 'Rice', unit: 'quintal', basePrice: 3200 },
      { name: 'Maize', unit: 'quintal', basePrice: 1800 },
      { name: 'Sugarcane', unit: 'ton', basePrice: 3500 },
      { name: 'Cotton', unit: 'quintal', basePrice: 5500 },
      { name: 'Soybean', unit: 'quintal', basePrice: 4200 },
      { name: 'Mustard', unit: 'quintal', basePrice: 5800 },
      { name: 'Gram', unit: 'quintal', basePrice: 6200 },
      { name: 'Arhar', unit: 'quintal', basePrice: 7500 },
      { name: 'Groundnut', unit: 'quintal', basePrice: 5200 }
    ];

    console.log('Adding crops...');
    for (const crop of crops) {
      const existing = sqlite.prepare('SELECT id FROM crops WHERE name = ?').get(crop.name);
      if (!existing) {
        sqlite.prepare('INSERT INTO crops (name, unit, base_price, created_at) VALUES (?, ?, ?, ?)').run(
          crop.name, crop.unit, crop.basePrice, Date.now()
        );
        console.log(`Added crop: ${crop.name} - ₹${crop.basePrice}/${crop.unit}`);
      }
    }

    // Sample parties
    const cityData = sqlite.prepare(`
      SELECT c.id, c.name as city_name, s.id as state_id, s.name as state_name 
      FROM cities c 
      JOIN states s ON c.state_id = s.id
    `).all() as { id: number, city_name: string, state_id: number, state_name: string }[];

    const parties = [
      {
        name: 'Ramesh Kumar Farms',
        type: 'farmer',
        contactNumber: '9876543210',
        email: 'ramesh@email.com',
        address: 'Village Kalyanpur',
        cityName: 'Lucknow'
      },
      {
        name: 'Singh Agricultural Co.',
        type: 'farmer',
        contactNumber: '9876543211',
        email: 'singh@email.com',
        address: 'Kharif Road',
        cityName: 'Amritsar'
      },
      {
        name: 'Mumbai Grain Traders',
        type: 'trader',
        contactNumber: '9876543212',
        email: 'mumbai@traders.com',
        address: 'APMC Market',
        cityName: 'Mumbai'
      },
      {
        name: 'Pune Export House',
        type: 'exporter',
        contactNumber: '9876543213',
        email: 'export@pune.com',
        address: 'Export Zone',
        cityName: 'Pune'
      },
      {
        name: 'Karnataka Farmers Union',
        type: 'farmer',
        contactNumber: '9876543214',
        email: 'karnataka@farmers.com',
        address: 'Rural Area',
        cityName: 'Bangalore'
      }
    ];

    console.log('Adding parties...');
    for (const party of parties) {
      const city = cityData.find(c => c.city_name === party.cityName);
      if (city) {
        const existing = sqlite.prepare('SELECT id FROM parties WHERE name = ?').get(party.name);
        if (!existing) {
          sqlite.prepare(`
            INSERT INTO parties (name, type, contact_number, email, address, city_id, state_id, balance, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
          `).run(
            party.name, party.type, party.contactNumber, party.email, party.address, 
            city.id, city.state_id, Date.now()
          );
          console.log(`Added party: ${party.name} (${party.type})`);
        }
      }
    }

    console.log('Database seeding completed successfully!');
    console.log('\nSample data added:');
    console.log('- States: 5 states with major agricultural regions');
    console.log('- Cities: 12 major cities across states');
    console.log('- Crops: 10 common crops with base prices');
    console.log('- Parties: 5 sample parties (farmers, traders, exporters)');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    sqlite.close();
  }
}

// Run seeding
seedDatabase();