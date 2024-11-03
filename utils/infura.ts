import { ethers } from 'ethers';
import * as jose from 'jose';

export async function createInfuraProvider() {
  try {
    const privateKey = process.env.JWT_PRIVATE_KEY
      .replace(/\\n/g, '\n')
      .replace(/"/g, '')
      .trim();

    // Create JWT token with required fields
    const token = await new jose.SignJWT({})
      .setProtectedHeader({ 
        alg: 'RS256',  // Explicitly set RS256 since we're using PKCS#8
        typ: 'JWT',
        kid: process.env.JWT_KEY_NAME
      })
      .setAudience('infura.io')
      .setExpirationTime('1h')
      .sign(await jose.importPKCS8(privateKey, 'RS256'));

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