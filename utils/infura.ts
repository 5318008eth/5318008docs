import { ethers } from 'ethers';
import * as jose from 'jose';
import * as fs from 'fs';

export async function createInfuraProvider() {
  try {
    // Create JWT token with required fields
    const token = await new jose.SignJWT({
      aud: 'infura.io',  // Required audience claim
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    })
      .setProtectedHeader({ 
        alg: 'RS256',
        typ: 'JWT',
        kid: process.env.JWT_KEY_NAME
      })
      .sign(await jose.importPKCS8(
        process.env.JWT_PRIVATE_KEY
          .replace(/\\n/g, '\n')  // Convert string newlines to actual newlines
          .replace(/"/g, ''),     // Remove quotes
        'RS256'
      ));

    // Create provider with JWT auth header
    const fetchRequest = new ethers.FetchRequest(process.env.INFURA_URL);
    fetchRequest.setHeader('Authorization', `Bearer ${token}`);

    // Create provider with custom FetchRequest
    return new ethers.JsonRpcProvider(fetchRequest);
  } catch (error) {
    console.error('Error creating Infura provider:', error);
    throw error;
  }
}