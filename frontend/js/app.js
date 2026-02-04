const connectBtn = document.getElementById("connect-btn");
const addressSpan = document.getElementById("user-address");
const networkBadge = document.getElementById("network-status");

const NETWORKS = {
    11155111: { name: "Sepolia", color: "success" },
    17000:    { name: "Holesky", color: "success" },
    31337:    { name: "Localhost", color: "warning" }
};

connectBtn.onclick = async () => {
    if (!window.ethereum) {
        alert("MetaMask is required!");
        return;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        const accounts = await provider.send("eth_requestAccounts", []);
        const userAddress = accounts[0];

        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        handleLogin(userAddress, chainId);

    } catch (error) {
        console.error(error);
        alert("Connection failed: " + error.message);
    }
};

function handleLogin(address, chainId) {
    connectBtn.classList.add("hidden");
    addressSpan.classList.remove("hidden");
    
    addressSpan.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;

    const netBadge = document.getElementById("network-badge");
    netBadge.classList.remove("hidden");

    if (NETWORKS[chainId]) {
        netBadge.textContent = `● ${NETWORKS[chainId].name}`;
        netBadge.className = `badge ${NETWORKS[chainId].color}`;
    } else {
        netBadge.textContent = "⚠ Wrong Network (Click to Switch)";
        netBadge.className = "badge error";
        
        netBadge.onclick = async () => switchNetwork();
    }
}

async function switchNetwork() {
    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
        });
        window.location.reload();
    } catch (error) {
        alert("Please switch network manually in MetaMask");
    }
}

if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => window.location.reload());
    window.ethereum.on('chainChanged', () => window.location.reload());
}