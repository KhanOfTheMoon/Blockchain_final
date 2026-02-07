const AppState = {
    provider: null,
    signer: null,
    cfContract: null,
    tokenContract: null,
    address: null
};

const App = {
    init: () => {
        DOM.connectBtn.onclick = App.connectWallet;
        DOM.inputs.createBtn.onclick = App.createCampaign;
        document.getElementById("btnRefresh").onclick = App.refreshBalances;
        document.getElementById("btnLoad").onclick = App.loadCampaigns;
    },

    connectWallet: async () => {
        if (!window.ethereum) return alert("Install MetaMask");
        AppState.provider = new ethers.BrowserProvider(window.ethereum);
        AppState.signer = await AppState.provider.getSigner();
        AppState.address = await AppState.signer.getAddress();
        
        AppState.cfContract = new ethers.Contract(CONFIG.CROWDFUNDING_ADDRESS, ABIS.CROWDFUNDING, AppState.signer);
        AppState.tokenContract = new ethers.Contract(CONFIG.TOKEN_ADDRESS, ABIS.TOKEN, AppState.signer);

        UI.updateOnConnect(AppState.address);
        App.checkNetwork();
        App.loadCampaigns();
        App.refreshBalances();
    },

    checkNetwork: async () => {
        const net = await AppState.provider.getNetwork();
        if (net.chainId === CONFIG.CHAIN_ID) UI.setNetwork("Sepolia", "success");
        else UI.setNetwork("Wrong Network", "error");
    },

    createCampaign: async () => {
        try {
            UI.setStatus("Creating...", "warning");
            const tx = await AppState.cfContract.createCampaign(
                DOM.inputs.title.value,
                ethers.parseEther(DOM.inputs.goal.value),
                DOM.inputs.duration.value
            );
            await tx.wait();
            UI.setStatus("Success!", "success");
            App.loadCampaigns();
        } catch (e) { UI.setStatus("Error", "error"); console.error(e); }
    },

    handleDonate: async (id) => {
        const val = document.getElementById(`donate-${id}`).value;
        if (!val) return alert("Value?");
        try {
            UI.setStatus("Donating...", "warning");
            const tx = await AppState.cfContract.contribute(id, { value: ethers.parseEther(val) });
            await tx.wait();
            UI.setStatus("Donated!", "success");
            App.loadCampaigns();
            App.refreshBalances();
        } catch (e) { UI.setStatus("Error", "error"); console.error(e); }
    },

    handleFinalize: async (id) => {
        try {
            UI.setStatus("Finalizing...", "warning");
            const tx = await AppState.cfContract.finalize(id);
            await tx.wait();
            UI.setStatus("Finalized!", "success");
            App.loadCampaigns();
        } catch (e) { UI.setStatus("Error", "error"); console.error(e); }
    },

    loadCampaigns: async () => {
        UI.setStatus("Loading...", "warning");
        const count = await AppState.cfContract.campaignCount();
        let html = "";
        for (let i = count; i >= 1; i--) {
            const data = await AppState.cfContract.getCampaign(i);
            html += UI.generateCardHTML(i, data);
        }
        UI.renderCampaigns(html || "<p>No campaigns</p>");
        UI.setStatus("Loaded", "success");
    },

    refreshBalances: async () => {
        if (!AppState.address) return;
        const eth = await AppState.provider.getBalance(AppState.address);
        DOM.ethBal.textContent = Number(ethers.formatEther(eth)).toFixed(4) + " ETH";
        const bal = await AppState.tokenContract.balanceOf(AppState.address);
        DOM.tokBal.textContent = ethers.formatUnits(bal, 18) + " RWD";
    }
};

document.addEventListener("DOMContentLoaded", App.init);