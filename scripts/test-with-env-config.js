#!/usr/bin/env node

/**
 * Test avec la même configuration que le MCP (utilise .env)
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Charger le .env comme le fait le CLI
config({ path: resolve(process.cwd(), '.env') });

const API_BASE_URL = 'http://localhost:3333';

async function testWithEnvConfig() {  
  const envApiKey = process.env.FIGMA_API_KEY;
  console.log(`Clé API du .env: ${envApiKey ? `${envApiKey.slice(0, 10)}...` : 'NON DÉFINIE'}`);
  
  if (!envApiKey) {
    console.error('❌ FIGMA_API_KEY non définie dans le .env');
    return;
  }

  try {
    console.log('\n1. Test avec clé API du .env...');
    
    const body = {
      figmaUrl: "https://www.figma.com/design/HGbcy1F99nWQOoxyQxtevi/Portfolio-BadVersion",
      figmaApiKey: envApiKey,
      outputFormat: "json"
    };

    console.log('Body envoyé:', JSON.stringify(body, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/audit-figma`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    console.log('Status:', response.status);
    const text = await response.text();
    
    if (response.ok) {
      console.log('✅ Succès de l`appel !');
    } else {
      console.log('❌ Échec de l`appel');
      console.log('Response:', text);
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

async function main() {
  await testWithEnvConfig();
}

main().catch(console.error);
