// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockERC20
 * @dev 테스트넷용 간단한 ERC20 토큰 컨트랙트
 * 
 * 배포 방법:
 * 1. Remix IDE (https://remix.ethereum.org) 사용
 * 2. 이 파일을 Remix에 복사
 * 3. 컴파일 (Solidity 0.8.20)
 * 4. Base Sepolia 네트워크에 배포
 * 5. 생성자 파라미터:
 *    - _name: "Test BLA Token" (또는 원하는 이름)
 *    - _symbol: "TBLA" (또는 원하는 심볼)
 *    - _initialSupply: 1000000 (초기 공급량)
 */
contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply * 10**decimals;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    function approve(address _spender, uint256 _value) public returns (bool) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool) {
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    /**
     * @dev 테스트용 Faucet 함수 - 누구나 호출 가능
     * @param _to 토큰을 받을 주소
     * @param _amount 민팅할 양 (wei 단위)
     */
    function mint(address _to, uint256 _amount) public {
        balanceOf[_to] += _amount;
        totalSupply += _amount;
        emit Transfer(address(0), _to, _amount);
    }
    
    /**
     * @dev 자신의 지갑에 토큰 민팅 (테스트용)
     * @param _amount 민팅할 양 (wei 단위)
     */
    function mintToSelf(uint256 _amount) public {
        mint(msg.sender, _amount);
    }
}


