import { ethers } from 'ethers';
import * as jose from 'jose';
import * as fs from 'fs';

function getAlgorithm(privateKey: string): 'RS256' | 'ES256' {
  if (privateKey.includes('BEGIN RSA PRIVATE KEY') || privateKey.includes('BEGIN PRIVATE KEY')) {
    return 'RS256';
  } else if (privateKey.includes('BEGIN EC PRIVATE KEY')) {
    return 'ES256';
  }
  throw new Error('Unsupported key type');
}

export async function createInfuraProvider() {
  try {
    const privateKey = process.env.JWT_PRIVATE_KEY;
    const algorithm = getAlgorithm(privateKey);

    // Create JWT token with required fields
    const token = await new jose.SignJWT({})  // Empty payload as per example
      .setProtectedHeader({ 
        alg: algorithm,
        typ: 'JWT',
        kid: process.env.JWT_KEY_NAME
      })
      .setAudience('infura.io')
      .setExpirationTime('1h')
      .sign(await jose.importPKCS8(
        privateKey
          .replace(/\\n/g, '\n')
          .replace(/"/g, ''),
        algorithm
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