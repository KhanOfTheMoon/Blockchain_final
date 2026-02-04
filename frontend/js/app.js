const connectBtn = document.getElementById("connect-btn");
const addressSpan = document.getElementById("user-address");
const networkBadge = document.getElementById("network-badge");
const statusBadge = document.getElementById("status-badge");

const ALLOWED_NETWORKS = {
    11155111: "Sepolia",
    17000: "Holesky",
    31337: "Localhost"
};

const SEPOLIA_CHAIN_ID = "0xaa36a7";

let provider;

connectBtn.onclick = async () => {
    if (!window.ethereum) {
        alert("MetaMask not found!");
        return;
    }

    try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        
        provider = new ethers.BrowserProvider(window.ethereum);
        
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        updateUI(address);
        checkNetwork();

    } catch (error) {
        console.error(error);
        setStatus("Connection Failed", "error");
    }
};

function updateUI(address) {
    connectBtn.classList.add("hidden");
    addressSpan.classList.remove("hidden");
    addressSpan.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function checkNetwork() {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    networkBadge.classList.remove("hidden");
    statusBadge.classList.remove("hidden");

    if (ALLOWED_NETWORKS[chainId]) {
        networkBadge.textContent = ALLOWED_NETWORKS[chainId];
        networkBadge.className = "badge success";
        setStatus("Network OK", "success");
    } else {
        networkBadge.textContent = "Wrong Network";
        networkBadge.className = "badge error";
        setStatus("Switch Network", "warning");
        
        networkBadge.onclick = async () => switchNetwork();
    }
}

async function switchNetwork() {
    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_CHAIN_ID }], 
        });
    } catch (e) {
        console.error("Switch rejected", e);
    }
}

function setStatus(msg, type) {
    statusBadge.textContent = msg;
    statusBadge.className = `badge ${type}`;
    statusBadge.classList.remove("hidden");
}

if (window.ethereum) {
    window.ethereum.on("chainChanged", () => window.location.reload());
    window.ethereum.on("accountsChanged", () => window.location.reload());
}