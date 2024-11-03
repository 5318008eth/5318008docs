import { ethers } from 'ethers';
import * as jose from 'jose';

export async function createInfuraProvider() {
  // Create JWT token
  const secret = new TextEncoder().encode(process.env.JWT_PRIVATE_KEY);
  const token = await new jose.SignJWT({ 
    api_key: process.env.INFURA_API_KEY,
    name: process.env.JWT_KEY_NAME
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);

  // Create provider with JWT auth header
  const fetchRequest = new ethers.FetchRequest(process.env.INFURA_URL);
  fetchRequest.setHeader('Authorization', `Bearer ${token}`);

  // Create provider with custom FetchRequest
  return new ethers.JsonRpcProvider(fetchRequest);
}