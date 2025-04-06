import { ethers, BrowserProvider } from "ethers";
import { abi, contractAddress } from "./constants";

declare var window: any

const connectButton = document.getElementById("connectButton")
const registerButton = document.getElementById("registerButton")
const approveButton = document.getElementById("approveButton")
const transferButton = document.getElementById("transferButton")
const burnButton = document.getElementById("burnButton")
const balanceButton = document.getElementById("balanceButton")
const checkRegisterButton = document.getElementById("checkRegisterButton")

if (connectButton) {
    connectButton.onclick = connect;
}

if (registerButton) {
    registerButton.onclick = register;
}

if (approveButton) {
    approveButton.onclick = async () => {
        const spender = (document.getElementById("approveAddress") as HTMLInputElement)?.value;
        const amount = (document.getElementById("approveAmount") as HTMLInputElement)?.value;
        if (spender && amount) {
            await approve(spender, amount);
        }
    };
}

if (transferButton) {
    transferButton.onclick = async () => {
        const to = (document.getElementById("transferAddress") as HTMLInputElement)?.value;
        const amount = (document.getElementById("transferAmount") as HTMLInputElement)?.value;
        if (to && amount) {
            await transfer(to, amount);
        }
    };
}

if (burnButton) {
    burnButton.onclick = async () => {
        const amount = (document.getElementById("burnAmount") as HTMLInputElement)?.value;
        if (amount) {
            await burn(amount);
        }
    };
}

if (balanceButton) {
    balanceButton.onclick = async () => {
        const address = (document.getElementById("balanceAddress") as HTMLInputElement)?.value;
        if (address) {
            const balance = await balanceOf(address);
            const resultDiv = document.getElementById("balanceResult");
            if (resultDiv) {
                resultDiv.innerHTML = `Balance: ${balance}`;
            }
        }
    };
}

if (checkRegisterButton) {
    checkRegisterButton.onclick = async () => {
        const address = (document.getElementById("checkRegisterAddress") as HTMLInputElement)?.value;
        if (address) {
            const isReg = await isRegistered(address);
            const resultDiv = document.getElementById("registerResult");
            if (resultDiv) {
                resultDiv.innerHTML = `Is Registered: ${isReg}`;
            }
        }
    };
}

interface EthereumProvider {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, handler: (accounts: string[]) => void) => void;
    removeListener: (eventName: string, handler: (accounts: string[]) => void) => void;
}

declare global {
    interface Window {
        ethereum?: EthereumProvider;
    }
}

// Replace your connect function with this updated version
async function connect(): Promise<void> {
    if (typeof window.ethereum !== "undefined") {
        try {
            console.log("MetaMask is installed!");

            // Add event listeners for account changes
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', () => window.location.reload());

            // Request account access
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            });
            
            // Handle the initial connection
            handleAccountsChanged(accounts);
            
        } catch (error) {
            console.error("Connection failed:", error);
            if (connectButton instanceof HTMLElement) {
                connectButton.innerHTML = "Connection Failed";
            }
        }
    } else {
        if (connectButton instanceof HTMLElement) {
            connectButton.innerHTML = "Please install MetaMask";
        }
        console.error("MetaMask is not installed");
    }
}

// Add this new function to handle account changes
function handleAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts
        console.log('Please connect to MetaMask.');
        if (connectButton instanceof HTMLElement) {
            connectButton.innerHTML = "Connect";
        }
    } else {
        // Update UI with the new account
        console.log('Connected account:', accounts[0]);
        if (connectButton instanceof HTMLElement) {
            connectButton.innerHTML = "Connected: " + accounts[0].slice(0, 6) + "...";
        }
        
        // Initialize ethers provider after connection
        const provider = new ethers.BrowserProvider(window.ethereum);
        provider.getSigner().then(signer => {
            console.log("Signer ready");
        }).catch(error => {
            console.error("Signer error:", error);
        });
    }
}

async function register(): Promise<void> {
    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    const accounts = await window.ethereum.request({ method: "eth_accounts" })
    const account = accounts[0]
    console.log("account connected: ", account)

    try {
        const tx = await contract.register(account)
        await tx.wait()
        console.log("Transaction successful: ", tx)
    } catch (error) {
        console.error("Transaction failed: ", error)
    }
}

async function approve(spender: string, amount: string): Promise<void> {
    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

    try {
        const tx = await contract.approve(spender, amount)
        await tx.wait()
        console.log("Approval successful: ", tx)
    } catch (error) {
        console.error("Approval failed: ", error)
    }
}

async function transfer(to: string, amount: string): Promise<void> {
    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

    try {
        const tx = await contract.transfer(to, amount)
        await tx.wait()
        console.log("Transfer successful: ", tx)
    } catch (error) {
        console.error("Transfer failed: ", error)
    }
}

async function burn(amount: string): Promise<void> {
    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

    try {
        const tx = await contract.burn(amount)
        await tx.wait()
        console.log("Burn successful: ", tx)
    } catch (error) {
        console.error("Burn failed: ", error)
    }
}

async function balanceOf(account: string): Promise<string> {
    const provider = new BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(contractAddress, abi, provider)

    try {
        const balance = await contract.balanceOf(account)
        return balance.toString()
    } catch (error) {
        console.error("Balance check failed: ", error)
        return "0"
    }
}

async function isRegistered(account: string): Promise<boolean> {
    const provider = new BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(contractAddress, abi, provider)

    try {
        return await contract.isRegistered(account)
    } catch (error) {
        console.error("Registration check failed: ", error)
        return false
    }
}