// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LitDucksCampaign.sol";

/**
 * @title LitDucksFactory
 * @notice Factory for deploying LitDucksCampaign contracts on LiteForge.
 * @dev Chain ID 4441 · RPC https://liteforge.rpc.caldera.xyz/http
 */
contract LitDucksFactory {

    address public factoryOwner;
    uint256 public proFee           = 0;   // 0 on testnet, 0.5 ether on mainnet
    uint256 public featuredFee      = 0;   // 0 on testnet, 2 ether on mainnet
    uint256 public freeTierMaxSlots = 100;

    address[] public allCampaigns;
    mapping(address => address[]) public creatorCampaigns;
    mapping(address => bool)      public isFeaturedCampaign;

    event CampaignCreated(
        address indexed campaignAddress,
        address indexed creator,
        string  name,
        bool    isPro,
        bool    isFeatured
    );
    event FeesUpdated(uint256 proFee, uint256 featuredFee);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event OwnershipTransferred(address indexed prev, address indexed next);

    modifier onlyOwner() {
        require(msg.sender == factoryOwner, "Factory: only owner");
        _;
    }

    constructor() {
        factoryOwner = msg.sender;
    }

    // ─── Create Campaign ──────────────────────────────────────────────────────
    function createCampaign(
        LitDucksCampaign.CampaignParams calldata params
    ) external payable returns (address campaignAddress) {

        require(bytes(params.name).length > 0,     "Factory: name required");
        require(params.totalSlots > 0,             "Factory: slots must be > 0");
        require(params.deadline > block.timestamp, "Factory: deadline must be future");
        require(params.selectionMode <= 1,         "Factory: invalid selectionMode");

        // Auto-upgrade to Pro if slots exceed free tier
        bool isPro = params.isPro || (params.totalSlots > freeTierMaxSlots);

        uint256 requiredPayment = 0;
        if (isPro)              requiredPayment += proFee;
        if (params.isFeatured)  requiredPayment += featuredFee;

        require(msg.value >= requiredPayment, "Factory: insufficient payment");

        // Build corrected params
        LitDucksCampaign.CampaignParams memory p = LitDucksCampaign.CampaignParams({
            name:             params.name,
            description:      params.description,
            bannerImage:      params.bannerImage,
            twitter:          params.twitter,
            discord:          params.discord,
            website:          params.website,
            totalSlots:       params.totalSlots,
            deadline:         params.deadline,
            selectionMode:    params.selectionMode,
            minTransactions:  params.minTransactions,
            minWalletAgeDays: params.minWalletAgeDays,
            requiredToken:    params.requiredToken,
            tokenType:        params.tokenType,
            minTokenBalance:  params.minTokenBalance,
            tokenId:          params.tokenId,
            isPro:            isPro,
            isFeatured:       params.isFeatured
        });

        // Deploy
        LitDucksCampaign campaign = new LitDucksCampaign(msg.sender, p);
        campaignAddress = address(campaign);

        allCampaigns.push(campaignAddress);
        creatorCampaigns[msg.sender].push(campaignAddress);
        if (params.isFeatured) isFeaturedCampaign[campaignAddress] = true;

        // Forward fee
        if (requiredPayment > 0) {
            (bool ok,) = payable(factoryOwner).call{value: requiredPayment}("");
            require(ok, "Factory: fee transfer failed");
        }

        // Refund excess
        if (msg.value > requiredPayment) {
            (bool ok2,) = payable(msg.sender).call{value: msg.value - requiredPayment}("");
            require(ok2, "Factory: refund failed");
        }

        emit CampaignCreated(campaignAddress, msg.sender, params.name, isPro, params.isFeatured);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────
    function setFees(uint256 _proFee, uint256 _featuredFee) external onlyOwner {
        proFee      = _proFee;
        featuredFee = _featuredFee;
        emit FeesUpdated(_proFee, _featuredFee);
    }

    function setFreeTierMaxSlots(uint256 _max) external onlyOwner {
        freeTierMaxSlots = _max;
    }

    function withdrawFees() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "Factory: nothing to withdraw");
        (bool ok,) = payable(factoryOwner).call{value: bal}("");
        require(ok, "Factory: withdraw failed");
        emit FeesWithdrawn(factoryOwner, bal);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Factory: zero address");
        emit OwnershipTransferred(factoryOwner, newOwner);
        factoryOwner = newOwner;
    }

    // ─── Views ────────────────────────────────────────────────────────────────
    function getAllCampaigns()
        external view returns (address[] memory) { return allCampaigns; }

    function getCampaignsCount()
        external view returns (uint256) { return allCampaigns.length; }

    function getCreatorCampaigns(address creator)
        external view returns (address[] memory) { return creatorCampaigns[creator]; }

    function getFeaturedCampaigns() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allCampaigns.length; i++) {
            if (isFeaturedCampaign[allCampaigns[i]]) count++;
        }
        address[] memory out = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < allCampaigns.length; i++) {
            if (isFeaturedCampaign[allCampaigns[i]]) out[idx++] = allCampaigns[i];
        }
        return out;
    }

    function getProFee()           external view returns (uint256) { return proFee; }
    function getFeaturedFee()      external view returns (uint256) { return featuredFee; }
    function getFreeTierMaxSlots() external view returns (uint256) { return freeTierMaxSlots; }

    receive() external payable {}
}
