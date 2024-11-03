import { ethers } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';
import NodeCache from 'node-cache';
import { cors } from './cors';
import { createInfuraProvider } from '../../utils/infura';

const CONTRACT_ADDRESS = '0xbB493890c5a30a047576f9114081Cb65038c651c';
const BALANCE_ADDRESS = '0x5479b46506167B5815C0775Ea3503B698764cb4b';
const ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function getETHPriceFromUniswap() view returns (uint256)',
  'function getBoobsPriceInUSD(uint256 ethPriceFromUniswap) view returns (uint256)'
];

const cache = new NodeCache({ stdTTL: 300 });

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (cors(req, res)) return;

    try {
        const cachedData = cache.get('liquidityData');
        if (cachedData) {
            return res.status(200).json({ result: cachedData });
        }

        const provider = await createInfuraProvider();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        const liquidSupply = await contract.balanceOf(BALANCE_ADDRESS);
        const ethPriceFromUniswap = await contract.getETHPriceFromUniswap();
        const boobsPriceinUSD = await contract.getBoobsPriceInUSD(ethPriceFromUniswap);

        const liquidity = (BigInt(liquidSupply) * BigInt(boobsPriceinUSD) * BigInt(2)) / (BigInt(10) ** BigInt(36));

        const result = liquidity.toString();

        cache.set('liquidityData', result);

        res.status(200).json({ result });
    } catch (error) {
        console.error('Error fetching liquidity:', error);
        res.status(500).json({ error: 'Error fetching liquidity data', details: error.message });
    }
}
