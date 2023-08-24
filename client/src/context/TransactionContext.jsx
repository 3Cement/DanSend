import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { BrowserProvider } from "ethers";

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

console.log('window', window)
console.log('window.ethereum', window.ethereum)
console.log('ethereum', ethereum)

const getEthereumContract = () => {
    console.log('getEthereumContract')
    // const provider = new ethers.providers.Web3Provider(ethereum);
    const provider = new BrowserProvider(window.ethereum);
    console.log('provider', provider)
    const signer = provider.getSigner();
    console.log('signer', signer)
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log('transactionContract', transactionContract)

    // console.log({
    //     provider,
    //     signer,
    //     transactionContract
    // });

    return transactionContract;
}

// const initialState = {}

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState('')
    const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: '' })
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionConut'));;

    const handleChange = (e, name) => {
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if(!ethereum) return alert("Please install metamask1");

            const accounts = await ethereum.request({ method: 'eth_accounts' });
            console.log("accounts1", accounts)

            if(accounts.length) {
                setCurrentAccount(accounts[0]);
    
                // getAllTransactions();
            } else {
                console.log('No accounts found');
            }
            console.log('accounts', accounts)
        } catch (error) {
            console.log(error);

            throw new Error('No ethereum object1.')
        }
    }

    const connectWallet = async () => {
        try {
            if(!ethereum) return alert("Please install metamask2");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            console.log("accounts2", accounts)

            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);

            throw new Error('No ethereum object2.')
        }
    }

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', // 21000 GWEI
                    value: parsedAmount._hex, // 0.00001
                }]
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);;
            
            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();

            setTransactionCount(transactionContract.toNumber());

        } catch (error) {
            console.log(error);

            throw new Error('No ethereum object3.')
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, sendTransaction, handleChange }}>
            {children}
        </TransactionContext.Provider>
    );
}