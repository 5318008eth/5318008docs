import { ethers } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';
import NodeCache from 'node-cache';

const CONTRACT_ADDRESS = '0xbB493890c5a30a047576f9114081Cb65038c651c';
const ABI = [
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function getETHPriceFromUniswap() view returns (uint256)',
  'function getBoobsPriceInUSD(uint256 ethPriceFromUniswap) view returns (uint256)'
];

const cache = new NodeCache({ stdTTL: 300 });

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // Check if we have cached data
        const cachedData = cache.get('circulatingMarketCapData');
        if (cachedData) {
            return res.status(200).json({ result: cachedData });
        }

        const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        const totalSupply = BigInt(await contract.totalSupply());
        const contractBalance = BigInt(await contract.balanceOf(CONTRACT_ADDRESS));
        const ethPriceFromUniswap = await contract.getETHPriceFromUniswap();
        const boobsPriceinUSD = BigInt(await contract.getBoobsPriceInUSD(ethPriceFromUniswap));

        const circulatingSupply = totalSupply - contractBalance;
        const circulatingMcap = (circulatingSupply * boobsPriceinUSD) / BigInt(1e36);

        const result = circulatingMcap.toString();

        // Cache the data
        cache.set('circulatingMarketCapData', result);

        res.status(200).json({ result });
    } catch (error) {
        console.error('Error fetching circulating market cap:', error);
        res.status(500).json({ error: 'Error fetching circulating market cap data', details: error.message });
    }
}
