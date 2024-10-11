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
        const cachedData = cache.get('supplyData');
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
        console.log('Provider created successfully');

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        console.log('Contract instance created successfully');

        const totalSupply = await contract.totalSupply();
        console.log('Total supply fetched:', totalSupply.toString());

        const contractBalance = await contract.balanceOf(CONTRACT_ADDRESS);
        console.log('Contract balance fetched:', contractBalance.toString());

        const circulatingSupply = totalSupply - contractBalance;

        const supplyData = {
            total_supply: totalSupply.toString(),
            circulating_supply: circulatingSupply.toString()
        };

        // Cache the data
        cache.set('supplyData', supplyData);

        res.status(200).json(supplyData);
    } catch (error) {
        console.error('Error fetching supply:', error);
        res.status(500).json({ error: 'Error fetching supply data', details: error.message, stack: error.stack });
    }
}