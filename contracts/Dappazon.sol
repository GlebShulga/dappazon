// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract Dappazon {
    address public owner;

    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 price;
        uint256 rating;
        uint256 stock;
    }

    struct Order {
        uint256 time;
        Item item;
    }

    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

    event List(string name, uint256 cost, uint256 quantity);
    event Buy(address buyer, uint256 orderId, uint256 itemId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can list products");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // List products
    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _price,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {
        // Create Item struct
        Item memory item = Item(
            _id,
            _name,
            _category,
            _image,
            _price,
            _rating,
            _stock
        );

        // Save item to the blockchain
        items[_id] = item;

        // Emit an event
        emit List(_name, _price, _stock);
    }

    event LogTimestamp(uint256 timestamp);

    // Buy products
    function buy(uint256 _id) public payable {
        Item memory item = items[_id];
        require(msg.value >= item.price, "Not enough funds");
        require(item.stock > 0, "Out of stock");
        // Create an order
        Order memory order = Order(block.timestamp, item);

        // Add order to user
        orderCount[msg.sender] ++;
        orders[msg.sender][orderCount[msg.sender]] = order;

        // Update stock
        items[_id].stock = item.stock - 1;
        // Emit an event
        emit Buy(msg.sender, orderCount[msg.sender], item.id);
    }

    // Withdraw funds
    function withdraw() public onlyOwner {
        (bool success, ) = payable(owner).call{value: address(this).balance}(
            ""
        );
        require(success, "Failed to withdraw funds");
    }
}
