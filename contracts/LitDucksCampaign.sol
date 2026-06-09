// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LitDucksCampaign
 * @notice Per-project whitelist campaign for LiteForge (LitVM).
 * @dev Chain ID 4441 · RPC https://liteforge.rpc.caldera.xyz/http
 */
contract LitDucksCampaign {

    // ─── Shared Struct (identical to Factory) ─────────────────────────────────
    struct CampaignParams {
        string  name;
        string  description;
        string  bannerImage;        // IPFS CID or URL
        string  twitter;
        string  discord;
        string  website;
        uint256 totalSlots;
        uint256 deadline;           // Unix timestamp
        uint8   selectionMode;      // 0 = FCFS, 1 = Raffle
        uint256 minTransactions;    // min tx count on LiteForge
        uint256 minWalletAgeDays;   // min wallet age in days
        address requiredToken;      // token/NFT contract (address(0) = none)
        uint8   tokenType;          // 0 = none, 1 = ERC-721, 2 = ERC-20
        uint256 minTokenBalance;    // min balance if ERC-20, or 1 if ERC-721
        uint256 tokenId;            // specific tokenId (0 = any)
        bool    isPro;
        bool    isFeatured;
    }

    // ─── State ────────────────────────────────────────────────────────────────
    address public creator;
    uint256 public createdAt;

    // Campaign config (stored from params)
    string  public name;
    string  public description;
    string  public bannerImage;
    string  public twitter;
    string  public discord;
    string  public website;
    uint256 public totalSlots;
    uint256 public deadline;
    uint8   public selectionMode;
    uint256 public minTransactions;
    uint256 public minWalletAgeDays;
    address public requiredToken;
    uint8   public tokenType;
    uint256 public minTokenBalance;
    uint256 public tokenId;
    bool    public isPro;
    bool    public isFeatured;

    // Registration
    address[] private _registrants;
    mapping(address => bool)    private _registered;
    mapping(address => uint256) private _registeredAt;

    // Winners
    address[] private _winners;
    bytes32   public  merkleRoot;
    bool      public  raffleRun;
    bool      private _locked;

    // ─── Events ───────────────────────────────────────────────────────────────
    event Registered(address indexed wallet, uint256 timestamp);
    event RaffleComplete(uint256 winnersCount, bytes32 merkleRoot, uint256 seed);
    event MerkleRootSet(bytes32 root);
    event MetadataUpdated();
    event CampaignExtended(uint256 newDeadline);

    // ─── Modifiers ────────────────────────────────────────────────────────────
    modifier onlyCreator()  { require(msg.sender == creator,  "not creator");  _; }
    modifier nonReentrant() { require(!_locked, "reentrant"); _locked = true;  _; _locked = false; }

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(address creator_, CampaignParams memory p) {
        require(bytes(p.name).length > 0,      "empty name");
        require(p.totalSlots > 0,              "zero slots");
        require(p.deadline > block.timestamp,  "deadline in past");
        require(p.selectionMode <= 1,          "invalid mode");

        creator         = creator_;
        createdAt       = block.timestamp;

        name            = p.name;
        description     = p.description;
        bannerImage     = p.bannerImage;
        twitter         = p.twitter;
        discord         = p.discord;
        website         = p.website;
        totalSlots      = p.totalSlots;
        deadline        = p.deadline;
        selectionMode   = p.selectionMode;
        minTransactions = p.minTransactions;
        minWalletAgeDays = p.minWalletAgeDays;
        requiredToken   = p.requiredToken;
        tokenType       = p.tokenType;
        minTokenBalance = p.minTokenBalance;
        tokenId         = p.tokenId;
        isPro           = p.isPro;
        isFeatured      = p.isFeatured;
    }

    // ─── Register ─────────────────────────────────────────────────────────────
    function register() external nonReentrant {
        require(block.timestamp <= deadline,        "registration closed");
        require(!_registered[msg.sender],           "already registered");

        // FCFS: check slot limit
        if (selectionMode == 0) {
            require(_registrants.length < totalSlots, "whitelist full");
        }
        // Raffle: no slot limit until deadline

        _registrants.push(msg.sender);
        _registered[msg.sender]   = true;
        _registeredAt[msg.sender] = block.timestamp;

        emit Registered(msg.sender, block.timestamp);
    }

    // ─── Raffle ───────────────────────────────────────────────────────────────
    function runRaffle(bytes32 merkleRoot_) external onlyCreator nonReentrant {
        require(selectionMode == 1,         "not a raffle");
        require(!raffleRun,                 "raffle already run");
        require(block.timestamp > deadline, "deadline not passed");

        uint256 n     = _registrants.length;
        uint256 slots = n < totalSlots ? n : totalSlots;

        // declare outside if to use in emit
        uint256 prevRand = block.prevrandao;

        if (n > 0 && slots > 0) {
            address[] memory pool = new address[](n);
            for (uint256 i = 0; i < n; i++) pool[i] = _registrants[i];

            bytes32 seed = bytes32(prevRand ^ block.timestamp);

            for (uint256 i = n - 1; i > 0 && (n - i - 1) < slots; i--) {
                uint256 j = uint256(keccak256(abi.encodePacked(seed, i))) % (i + 1);
                address tmp = pool[i];
                pool[i]     = pool[j];
                pool[j]     = tmp;
            }

            for (uint256 i = 0; i < slots; i++) {
                _winners.push(pool[n - 1 - i]);
            }
        }

        merkleRoot = merkleRoot_;
        raffleRun  = true;

        emit RaffleComplete(slots, merkleRoot_, prevRand);
    }

    // ─── Creator Actions ──────────────────────────────────────────────────────
    function setMerkleRoot(bytes32 root) external onlyCreator {
        merkleRoot = root;
        emit MerkleRootSet(root);
    }

    function setMetadata(
        string calldata bannerImage_,
        string calldata twitter_,
        string calldata discord_,
        string calldata website_
    ) external onlyCreator {
        bannerImage = bannerImage_;
        twitter     = twitter_;
        discord     = discord_;
        website     = website_;
        emit MetadataUpdated();
    }

    function extendDeadline(uint256 newDeadline) external onlyCreator {
        require(newDeadline > deadline, "must extend forward");
        deadline = newDeadline;
        emit CampaignExtended(newDeadline);
    }

    // ─── Views ────────────────────────────────────────────────────────────────
    function registrantCount()       external view returns (uint256)          { return _registrants.length; }
    function isRegistered(address a) external view returns (bool)             { return _registered[a]; }
    function registeredAt(address a) external view returns (uint256)          { return _registeredAt[a]; }
    function getRegistrants()        external view returns (address[] memory) { return _registrants; }
    function getWinners()            external view returns (address[] memory) { return _winners; }
    function winnerCount()           external view returns (uint256)          { return _winners.length; }
    function isActive()              external view returns (bool)             { return block.timestamp <= deadline; }

    function isWinner(address a) external view returns (bool) {
        for (uint256 i = 0; i < _winners.length; i++) {
            if (_winners[i] == a) return true;
        }
        return false;
    }

    function slotsRemaining() external view returns (uint256) {
        if (selectionMode == 0) {
            if (_registrants.length >= totalSlots) return 0;
            return totalSlots - _registrants.length;
        }
        return type(uint256).max; // raffle mode
    }

    function getParams() external view returns (CampaignParams memory) {
        return CampaignParams({
            name:             name,
            description:      description,
            bannerImage:      bannerImage,
            twitter:          twitter,
            discord:          discord,
            website:          website,
            totalSlots:       totalSlots,
            deadline:         deadline,
            selectionMode:    selectionMode,
            minTransactions:  minTransactions,
            minWalletAgeDays: minWalletAgeDays,
            requiredToken:    requiredToken,
            tokenType:        tokenType,
            minTokenBalance:  minTokenBalance,
            tokenId:          tokenId,
            isPro:            isPro,
            isFeatured:       isFeatured
        });
    }
}
