const DOM = {
    connectBtn: document.getElementById("connect-btn"),
    addressSpan: document.getElementById("user-address"),
    networkBadge: document.getElementById("network-badge"),
    statusBadge: document.getElementById("status-badge"),
    dashboardSection: document.getElementById("dashboard-section"),
    campaignsSection: document.getElementById("campaigns-section"),
    placeholder: document.getElementById("connect-placeholder"),
    ethBal: document.getElementById("ethBal"),
    tokBal: document.getElementById("tokBal"),
    campaignsGrid: document.getElementById("campaigns-grid"),
    inputs: {
        title: document.getElementById("new-title"),
        goal: document.getElementById("new-goal"),
        duration: document.getElementById("new-duration"),
        createBtn: document.getElementById("btnCreate")
    }
};

const UI = {
    setStatus: (msg, type) => {
        DOM.statusBadge.textContent = msg;
        DOM.statusBadge.className = `badge ${type}`;
        DOM.statusBadge.classList.remove("hidden");
        setTimeout(() => DOM.statusBadge.classList.add("hidden"), 5000);
    },

    setNetwork: (name, type) => {
        DOM.networkBadge.textContent = name;
        DOM.networkBadge.className = `badge ${type}`;
        DOM.networkBadge.classList.remove("hidden");
    },

    updateOnConnect: (address) => {
        DOM.connectBtn.classList.add("hidden");
        DOM.placeholder.classList.add("hidden");
        DOM.addressSpan.classList.remove("hidden");
        DOM.addressSpan.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
        DOM.dashboardSection.classList.remove("hidden");
        DOM.campaignsSection.classList.remove("hidden");
    },

    renderCampaigns: (campaignsHTML) => {
        DOM.campaignsGrid.innerHTML = campaignsHTML;
    },

    generateCardHTML: (id, data) => {
        const [title, creator, goalWei, deadline, raisedWei, finalized, successful] = data;
        const goal = ethers.formatEther(goalWei);
        const raised = ethers.formatEther(raisedWei);
        const date = new Date(Number(deadline) * 1000).toLocaleString();
        const now = Math.floor(Date.now() / 1000);
        const isEnded = now >= Number(deadline);

        let statusClass = finalized ? (successful ? "status-success" : "status-ended") : (isEnded ? "status-ended" : "status-active");
        let statusText = finalized ? (successful ? "SUCCESS" : "FAILED") : (isEnded ? "ENDED" : "ACTIVE");

        let actionBtn = "";
        if (!isEnded && !finalized) {
            actionBtn = `<div class="action-row"><input type="number" id="donate-${id}" placeholder="0.01"><button class="btn-primary" onclick="App.handleDonate(${id})">Donate</button></div>`;
        } else if (isEnded && !finalized) {
            actionBtn = `<button class="btn-finalize" onclick="App.handleFinalize(${id})">Finalize</button>`;
        }

        return `
            <div class="camp-card">
                <div class="camp-header"><span class="camp-id">#${id}</span><span class="camp-status ${statusClass}">${statusText}</span></div>
                <h3>${title}</h3>
                <div class="camp-details">
                    <p>Goal: ${goal} ETH</p><p>Raised: ${raised} ETH</p><p>Deadline: ${date}</p>
                </div>
                <div class="camp-actions">${actionBtn}</div>
            </div>`;
    }
};