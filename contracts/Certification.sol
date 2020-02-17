pragma solidity >=0.4.21 <0.7.0;

contract Certification {

    address payable public owner;

    mapping(address => Class[]) enrolledClass;

    event ClassPaid(address student, address owner, uint value);

    struct Certificate {
        uint id;
        string penerima;
    }

    struct Class {
        string uid;
        uint256 date_register;
        uint256 date_finish;
    }

    constructor() public {
        owner = msg.sender;
    }

    function() external payable {
        enrollClass(msg.value, msg.sender, "0Nm3ZlDWPBTqqWzfSgBY");
    }

    function getContractAddress() public returns (address){
        return address(this);
    }

    function getContractBalance() public returns (uint){
        return address(this).balance;
    }

    function enrollClass(uint _value, address student, string memory classId) public {
        // Save this for an assertion in the future
        // Send Money
        enrolledClass[msg.sender].push(Class(classId, now, 0));
        emit ClassPaid(msg.sender, owner, _value);
        //        owner.transfer(_value);
    }
}
