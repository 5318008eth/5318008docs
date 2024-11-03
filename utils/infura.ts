import { ethers } from 'ethers';
import * as jose from 'jose';

export async function createInfuraProvider() {
  try {
    // Import the private key for signing
    const privateKey = await jose.importPKCS8(
      process.env.JWT_PRIVATE_KEY,
      'RS256'
    );

    // Create JWT token with required fields
    const token = await new jose.SignJWT({ 
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      aud: 'infura.io'
    })
      .setProtectedHeader({ 
        alg: 'RS256',
        typ: 'JWT',
        kid: process.env.JWT_KEY_NAME  // Using key name as the Key ID
      })
      .sign(privateKey);

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