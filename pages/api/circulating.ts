import { ethers } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';
import NodeCache from 'node-cache';

const CONTRACT_ADDRESS = '0xbB493890c5a30a047576f9114081Cb65038c651c';
const ABI = [
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)'
];

const cache = new NodeCache({ stdTTL: 300 });

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // Check if we have cached data
        const cachedData = cache.get('circulatingSupplyData');
        if (cachedData) {
            return res.status(200).json({ result: cachedData });
        }

        const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        const totalSupply = await contract.totalSupply();
        const contractBalance = await contract.balanceOf(CONTRACT_ADDRESS);

        const circulatingSupply = totalSupply - contractBalance;

        const result = circulatingSupply.toString();

        // Cache the data
        cache.set('circulatingSupplyData', result);

        res.status(200).json({ result });
    } catch (error) {
        console.error('Error fetching circulating supply:', error);
        res.status(500).json({ error: 'Error fetching circulating supply data', details: error.message });
    }
}