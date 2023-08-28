import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { BrowserProvider } from "ethers";
import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = async() => {
    console.log('getEthereumContract')
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionsContract;
}


// const initialState = {}

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState('')
    const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: '' })
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([])

    const handleChange = (e, name) => {
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
    }

    const getAllTransactions = async () => {
        try {
            if(!ethereum) return alert("Please install metamask4");
            const transactionContractPromise = getEthereumContract();
            const transactionsContract = await transactionContractPromise;
            const availableTransactions = await transactionsContract.gettAllTransactions();
            
            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(Number(transaction.timestamp) * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount) / (10 ** 18)
              }));
      
              console.log(structuredTransactions);
      
              setTransactions(structuredTransactions);
        } catch (error) {
            console.log(error);

            throw new Error('No ethereum object5.')
        }
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if(!ethereum) return alert("Please install metamask1");

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if(accounts.length) {
                setCurrentAccount(accounts[0]);
    
                getAllTransactions();
            } else {
                console.log('No accounts found');
            }
            console.log('accounts', accounts)
        } catch (error) {
            console.log(error);

            throw new Error('No ethereum object1.')
        }
    }

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContractPromise = getEthereumContract();
            const transactionsContract = await transactionContractPromise;
            const transactionsCount = await transactionsContract.getTransactionCount();
            console.log("transactionsCount4", transactionsCount)
            
            window.localStorage.setItem("transactionsCount", transactionsCount)
        } catch (error) {
            console.log(error);

            throw new Error('No ethereum object4.')
        }
    }

    const connectWallet = async () => {
        try {
            if(!ethereum) return alert("Please install metamask2");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

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
            const transactionContractPromise = getEthereumContract();
            const transactionsContract = await transactionContractPromise;
            const parsedAmount = ethers.parseEther(amount);

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', // 21000 GWEI
                    value: parsedAmount._hex, // 0.00001
                }]
            });

            const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionsCount = await transactionsContract.getTransactionCount();
            console.log("transactionsCount", transactionsCount)

            setTransactionCount(Number(transactionsCount));

        } catch (error) {
            console.log(error);

            throw new Error('No ethereum object3.')
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, []);

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, sendTransaction, handleChange, transactions, isLoading }}>
            {children}
        </TransactionContext.Provider>
    );
}