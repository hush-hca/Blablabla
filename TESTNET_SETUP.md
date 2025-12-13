# 테스트넷 설정 가이드 (Testnet Setup Guide)

## 개요

이 가이드는 Base Sepolia 테스트넷에서 앱을 테스트하는 방법을 설명합니다.

## 1. 환경 변수 설정

`.env.local` 파일에 다음을 추가하거나 수정하세요:

```env
# 네트워크 설정 (중요!)
NEXT_PUBLIC_NETWORK=testnet

# Base Sepolia 테스트넷 설정
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# 테스트넷 토큰 컨트랙트 주소
# 아래 주소들은 예시입니다. 실제로는 자신이 배포한 컨트랙트 주소를 사용하세요.
NEXT_PUBLIC_HUNT_TOKEN=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_BLA_TOKEN=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_USDC_TOKEN=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Payment Receiver (테스트용 지갑 주소)
NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS=your_test_wallet_address

# 나머지 설정은 동일
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. 테스트넷 토큰 배포 또는 획득

### 옵션 A: 테스트 ERC20 토큰 배포

테스트를 위해 간단한 ERC20 토큰을 배포해야 합니다:

1. **Remix IDE** 또는 **Hardhat** 사용
2. 표준 ERC20 컨트랙트 배포 (예: OpenZeppelin ERC20)
3. 배포된 주소를 환경 변수에 추가

### 옵션 B: 기존 테스트 토큰 사용

Base Sepolia에서 사용 가능한 테스트 토큰:
- **USDC Test Token**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
  - Faucet: [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

### 옵션 C: Mock 토큰 컨트랙트 작성

테스트용으로 간단한 Mock ERC20 컨트랙트를 배포할 수 있습니다:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply * 10**18;
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        return true;
    }
    
    function approve(address _spender, uint256 _value) public returns (bool) {
        allowance[msg.sender][_spender] = _value;
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        return true;
    }
    
    // Faucet function for testing
    function mint(address _to, uint256 _amount) public {
        balanceOf[_to] += _amount;
        totalSupply += _amount;
    }
}
```

## 3. 테스트넷 ETH 획득

Base Sepolia 테스트넷에서 테스트하려면 ETH가 필요합니다:

1. [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet) 방문
2. 지갑 주소 입력
3. 테스트 ETH 받기

## 4. 테스트 단계

### 4.1 지갑 연결 테스트
- MetaMask에서 Base Sepolia 네트워크 추가
- 앱에서 지갑 연결 확인

### 4.2 토큰 잔액 확인
- 배포한 테스트 토큰이 지갑에 있는지 확인
- 필요시 faucet에서 받거나 mint 함수 사용

### 4.3 결제 테스트
- 음성 메시지 녹음
- 결제 모달에서 토큰 선택
- 트랜잭션 승인 및 확인

### 4.4 전체 플로우 테스트
- 음성 메시지 포스팅
- 반응 추가 (BB Points 획득)
- 클레임 기능 테스트

## 5. 메인넷으로 전환

테스트가 완료되면 메인넷으로 전환:

```env
# 메인넷 설정
NEXT_PUBLIC_NETWORK=mainnet
# 또는 환경 변수 제거 (기본값이 mainnet)

NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# 메인넷 토큰 주소
NEXT_PUBLIC_HUNT_TOKEN=0x37f0c2915CeCcE7e977183B8543Fc0864d03e064C
NEXT_PUBLIC_USDC_TOKEN=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_BLA_TOKEN=your_mainnet_bla_token_address
```

## 6. 주의사항

⚠️ **중요:**
- 테스트넷과 메인넷은 완전히 분리된 네트워크입니다
- 테스트넷 토큰은 실제 가치가 없습니다
- 메인넷 배포 전 반드시 테스트넷에서 모든 기능을 테스트하세요
- 환경 변수를 변경한 후 개발 서버를 재시작하세요

## 7. 문제 해결

### 지갑이 테스트넷에 연결되지 않음
- MetaMask에서 Base Sepolia 네트워크가 추가되어 있는지 확인
- 네트워크 ID가 84532인지 확인

### 토큰 잔액이 0으로 표시됨
- 테스트 토큰이 배포되었는지 확인
- 컨트랙트 주소가 올바른지 확인
- 지갑에 토큰이 있는지 확인

### 트랜잭션이 실패함
- 테스트넷 ETH가 충분한지 확인
- 컨트랙트 주소가 올바른지 확인
- RPC URL이 올바른지 확인

