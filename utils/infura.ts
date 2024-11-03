import { ethers } from 'ethers';
import * as jose from 'jose';

export async function createInfuraProvider() {
  try {
    // Import the public key directly with its headers
    const privateKey = await jose.importSPKI(
      process.env.JWT_PUBLIC_KEY,  // Use the public key with headers intact
      'ES256'
    );

    // Create JWT token
    const token = await new jose.SignJWT({ 
      api_key: process.env.INFURA_API_KEY,
      name: process.env.JWT_KEY_NAME
    })
      .setProtectedHeader({ alg: 'ES256' })
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