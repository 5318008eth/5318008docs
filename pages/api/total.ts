import { ethers } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';
import NodeCache from 'node-cache';
import { cors } from './cors';
import { createInfuraProvider } from '../../utils/infura';

const CONTRACT_ADDRESS = '0xbB493890c5a30a047576f9114081Cb65038c651c';
const ABI = [
  'function totalSupply() view returns (uint256)'
];

const cache = new NodeCache({ stdTTL: 300 });

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (cors(req, res)) return;

    try {
        // Check if we have cached data
        const cachedData = cache.get('totalSupplyData');
        if (cachedData) {
            return res.status(200).json({ result: cachedData });
        }

        // Use the new provider with JWT auth
        const provider = await createInfuraProvider();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        const totalSupply = await contract.totalSupply();

        const result = totalSupply.toString();

        // Cache the data
        cache.set('totalSupplyData', result);

        res.status(200).json({ result });
    } catch (error) {
        console.error('Error fetching total supply:', error);
        res.status(500).json({ error: 'Error fetching total supply data', details: error.message });
    }
}
