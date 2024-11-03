import { ethers } from 'ethers';
import * as jose from 'jose';
import * as crypto from 'crypto';

export async function createInfuraProvider() {
  try {
    // Convert RSA key to PKCS8 format using Node's crypto
    const keyObject = crypto.createPrivateKey(process.env.JWT_PRIVATE_KEY);
    const pkcs8Key = keyObject.export({
      type: 'pkcs8',
      format: 'pem'
    });

    // Create JWT token with required fields
    const token = await new jose.SignJWT({ 
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      aud: 'infura.io'
    })
      .setProtectedHeader({ 
        alg: 'RS256',
        typ: 'JWT',
        kid: process.env.JWT_KEY_NAME  // Using the ID from environment variable
      })
      .sign(await jose.importPKCS8(pkcs8Key.toString(), 'RS256'));

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