import { ethers } from 'ethers';
import * as jose from 'jose';

export async function createInfuraProvider() {
  try {
    // Clean and format the private key
    const cleanPrivateKey = process.env.JWT_PRIVATE_KEY
      .replace(/-----(BEGIN|END) EC PRIVATE KEY-----/g, '')
      .replace(/\n/g, '')
      .trim();

    // Convert EC key to PKCS8 format
    const pkcs8Header = '-----BEGIN PRIVATE KEY-----\n';
    const pkcs8Footer = '\n-----END PRIVATE KEY-----';
    
    // Create the PKCS8 formatted key
    const pkcs8Key = `${pkcs8Header}${cleanPrivateKey}${pkcs8Footer}`;

    // Import the private key for signing
    const privateKey = await jose.importPKCS8(pkcs8Key, 'ES256');

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