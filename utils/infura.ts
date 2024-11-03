import { ethers } from 'ethers';
import * as jose from 'jose';

export async function createInfuraProvider() {
  try {
    // Import the private key for signing
    const privateKey = await jose.importPKCS8(
      process.env.JWT_PRIVATE_KEY,
      'RS256'  // Changed to RS256 for RSA
    );

    // Create JWT token with required fields
    const token = await new jose.SignJWT({ 
      api_key: process.env.INFURA_API_KEY,
      name: process.env.JWT_KEY_NAME,
      aud: 'infura.io'  // Required audience claim
    })
      .setProtectedHeader({ 
        alg: 'RS256',  // Changed to RS256
        typ: 'JWT'
      })
      .setIssuedAt()
      .setExpirationTime('1h')
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