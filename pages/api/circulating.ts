import { ethers } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';
import NodeCache from 'node-cache';
import { cors } from './cors';
import { createInfuraProvider } from '../../utils/infura';

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
    if (cors(req, res)) return;

    try {
        const cachedData = cache.get('circulatingSupplyData');
        if (cachedData) {
            return res.status(200).json({ result: cachedData });
        }

        const provider = await createInfuraProvider();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        const totalSupply = await contract.totalSupply();
        const contractBalance = await contract.balanceOf(CONTRACT_ADDRESS);

        const circulatingSupply = totalSupply - contractBalance;

        const result = circulatingSupply.toString();

        cache.set('circulatingSupplyData', result);

        res.status(200).json({ result });
    } catch (error) {
        console.error('Error fetching circulating supply:', error);
        res.status(500).json({ error: 'Error fetching circulating supply data', details: error.message });
    }
}
