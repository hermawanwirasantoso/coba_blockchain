pragma solidity >=0.4.21 <0.7.0;

contract Certification {

    address payable public owner;

    address payable public contractAddress = address(this);

    mapping(address => Class[]) public enrolledClass;

    mapping(address => uint) public classCount;

    mapping(uint => Certificate) public publishedCertificates;
//
    uint public certificateCount;

    event ClassPaid(address student, address owner, uint value);

    struct Certificate {
        uint id;
        address penerima;
        uint256 published_date;
        string classId;
    }

    struct Class {
        string uid;
        uint256 date_register;
    }

    constructor() public {
        owner = msg.sender;
    }

    function() external payable {
        //        enrollClass(msg.value, msg.sender, "0Nm3ZlDWPBTqqWzfSgBY");
    }

    function enrollClass(uint _value, string memory classId) public {
//        require(address(this).balance == _value);
        classCount[msg.sender]++;
        enrolledClass[msg.sender].push(Class(classId, now));
        emit ClassPaid(msg.sender, owner, _value);
        owner.transfer(_value);
    }

    function publishCertificate(string memory classId) public {
        uint jumlahKelas = classCount[msg.sender];
        Class[] memory classList = enrolledClass[msg.sender];

        // cek apakah betul mengambil kelas
        bool isMatch = true;
        uint classPosition;
        for (uint i = 0; i < jumlahKelas; i++) {
            bytes memory a = bytes(classList[i].uid);
            bytes memory b = bytes(classId);
            if(a.length != b.length){
                isMatch = false;
            }else{
                bool beda = false;
                for (uint j = 0; j < a.length; j++) {
                    if (a[j] != b[j]) {
                        beda = true;
                    }
                }
                if(beda){
                    isMatch = false;
                }else{
                    isMatch = true;
                    classPosition = i;
                    break;
                }
            }
        }
        require(isMatch == true);
//        require(classList[classPosition].date_finish == 0);
//        classList[classPosition].date_finish = now;
        bool isPublished = false;
        for(uint i=1;i<=certificateCount;i++){
            Certificate memory cert = publishedCertificates[certificateCount];
            if(cert.penerima==msg.sender){
//                if(cert.classId==classId){
                    //                    isPublished = true;
                    //                }
                bytes memory a = bytes(cert.classId);
                bytes memory b = bytes(classId);
                if(a.length != b.length){
                    continue;
                }else{
                    bool beda = false;
                    for (uint j = 0; j < a.length; j++) {
                        if (a[j] != b[j]) {
                            beda = true;
                        }
                    }
                    if(beda){
                        continue;
                    }else{
                        isPublished = true;
                    }
                }
            }
        }

        require(isPublished == false);
        // terbitkan sertifikat (uid mulai nomor 1)
        certificateCount++;
        publishedCertificates[certificateCount] = Certificate(certificateCount, msg.sender, now, classId);
    }


}
