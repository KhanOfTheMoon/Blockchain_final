// CONFIGURATION
const CROWDFUNDING_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const CROWDFUNDING_ABI = [
  "function campaignCount() view returns (uint256)",
  "function getCampaign(uint256 id) view returns (string,address,uint256,uint256,uint256,bool,bool)",
  "function finalize(uint256 id)",
  "function createCampaign(string title, uint256 goalWei, uint256 durationSeconds) returns (uint256)",
  "function contribute(uint256 id) payable"
];

const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// VARIABLES
const connectBtn = document.getElementById("connect-btn");
const addressSpan = document.getElementById("user-address");
const networkBadge = document.getElementById("network-badge");
const statusBadge = document.getElementById("status-badge");

const dashboardSection = document.getElementById("dashboard-section");
const campaignsSection = document.getElementById("campaigns-section");
const placeholder = document.getElementById("connect-placeholder");

const ethBalEl = document.getElementById("ethBal");
const tokBalEl = document.getElementById("tokBal");
const btnRefresh = document.getElementById("btnRefresh");
const btnLoad = document.getElementById("btnLoad");
const campaignsDiv = document.getElementById("campaigns-grid");

let provider, signer, cfContract, tokenContract;

// INITIALIZATION
connectBtn.onclick = async () => {
    if (!window.ethereum) return alert("MetaMask not found!");
    try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        await initApp();
    } catch (e) {
        console.error(e);
        setStatus("Connection Failed", "error");
    }
};

async function initApp() {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    
    if (CROWDFUNDING_ADDRESS && TOKEN_ADDRESS) {
        cfContract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, signer);
        tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
    } else {
        alert("⚠️ WARNING: Contract addresses not set in app.js!");
    }

    const address = await signer.getAddress();
    
    updateUI(address);
    checkNetwork();
    
    refreshBalances();
}

// CORE LOGIC

async function refreshBalances() {
    if (!signer) return;
    try {
        const address = await signer.getAddress();
        
        const eth = await provider.getBalance(address);
        ethBalEl.textContent = Number(ethers.formatEther(eth)).toFixed(4) + " ETH";

        if (tokenContract) {
            const [decimals, symbol, balance] = await Promise.all([
                tokenContract.decimals(),
                tokenContract.symbol(),
                tokenContract.balanceOf(address)
            ]);
            tokBalEl.textContent = `${ethers.formatUnits(balance, decimals)} ${symbol}`;
        }
    } catch (e) {
        console.error("Balance Error:", e);
        setStatus("Error loading balances", "error");
    }
}

async function loadCampaigns() {
    if (!cfContract) return;
    try {
        setStatus("Loading...", "warning");
        const count = Number(await cfContract.campaignCount());
        campaignsDiv.innerHTML = "";

        if (count === 0) {
            campaignsDiv.innerHTML = "<p>No campaigns found.</p>";
            return;
        }

        for (let i = 1; i <= count; i++) {
            const c = await cfContract.getCampaign(i);
            renderCampaignCard(i, c);
        }
        setStatus("Campaigns Loaded", "success");

    } catch (e) {
        console.error("Load Error:", e);
        setStatus("Failed to load campaigns", "error");
    }
}

function renderCampaignCard(id, data) {
    const [title, creator, goalWei, deadline, raisedWei, finalized, successful] = data;
    
    const goal = ethers.formatEther(goalWei);
    const raised = ethers.formatEther(raisedWei);
    const date = new Date(Number(deadline) * 1000).toLocaleString();
    const now = Math.floor(Date.now() / 1000);
    const isEnded = now >= Number(deadline);

    let statusText = "ACTIVE";
    let statusClass = "status-active";
    
    if (finalized) {
        statusText = successful ? "SUCCESS" : "FAILED";
        statusClass = successful ? "status-success" : "status-ended";
    } else if (isEnded) {
        statusText = "ENDED (Not Finalized)";
        statusClass = "status-ended";
    }

    const card = document.createElement("div");
    card.className = "camp-card";
    card.innerHTML = `
        <div class="camp-header">
            <span class="camp-id">#${id}</span>
            <span class="camp-status ${statusClass}">${statusText}</span>
        </div>
        <h3>${title}</h3>
        <div class="camp-details">
            <p>Goal: <b>${goal} ETH</b></p>
            <p>Raised: <b>${raised} ETH</b></p>
            <p>Deadline: ${date}</p>
            <p>👤Creator: ${creator.slice(0,6)}...${creator.slice(-4)}</p>
        </div>
        <div class="camp-actions">
            <button class="btn-finalize" onclick="finalizeCampaign(${id})" 
                ${(finalized || !isEnded) ? "disabled" : ""}>
                Finalize Campaign
            </button>
        </div>
    `;
    campaignsDiv.appendChild(card);
}

window.finalizeCampaign = async (id) => {
    if (!cfContract) return;
    try {
        const tx = await cfContract.finalize(id);
        setStatus("Finalizing...", "warning");
        await tx.wait();
        
        setStatus("Finalized!", "success");
        loadCampaigns();
        refreshBalances();
    } catch (e) {
        console.error(e);
        alert("Error finalizing: " + (e.reason || e.message));
    }
};

// LISTENERS 
btnRefresh.onclick = refreshBalances;
btnLoad.onclick = loadCampaigns;

// UI HELPERS
function updateUI(address) {
    connectBtn.classList.add("hidden");
    placeholder.classList.add("hidden");
    
    addressSpan.classList.remove("hidden");
    addressSpan.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
    
    dashboardSection.classList.remove("hidden");
    campaignsSection.classList.remove("hidden");
}

function setStatus(msg, type) {
    statusBadge.textContent = msg;
    statusBadge.className = `badge ${type}`;
    statusBadge.classList.remove("hidden");
}

async function checkNetwork() {
    const net = await provider.getNetwork();
    if (net.chainId === 11155111n) {
        networkBadge.textContent = "Sepolia";
        networkBadge.className = "badge success";
    } else if (net.chainId === 31337n) {
        networkBadge.textContent = "Localhost";
        networkBadge.className = "badge warning";
    } else {
        networkBadge.textContent = "Wrong Network";
        networkBadge.className = "badge error";
    }
    networkBadge.classList.remove("hidden");
}