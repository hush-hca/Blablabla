# 테스트넷 토큰 배포 가이드

## Remix IDE를 사용한 배포

### 1. Remix IDE 접속
https://remix.ethereum.org

### 2. 파일 생성
1. 왼쪽 파일 탐색기에서 `contracts` 폴더 생성
2. `MockERC20.sol` 파일 생성
3. 이 디렉토리의 `MockERC20.sol` 내용 복사

### 3. 컴파일
1. 왼쪽 "Solidity Compiler" 탭 클릭
2. Compiler 버전: `0.8.20` 선택
3. "Compile MockERC20.sol" 클릭

### 4. 배포
1. 왼쪽 "Deploy & Run Transactions" 탭 클릭
2. Environment: "Injected Provider - MetaMask" 선택
3. MetaMask에서 Base Sepolia 네트워크로 전환
4. Contract: "MockERC20" 선택
5. 생성자 파라미터 입력:
   - `_name`: `"Test BLA Token"`
   - `_symbol`: `"TBLA"`
   - `_initialSupply`: `1000000`
6. "Deploy" 클릭
7. MetaMask에서 트랜잭션 승인

### 5. 배포된 컨트랙트 주소 복사
- 배포 후 아래에 표시되는 컨트랙트 주소 복사
- `.env.local` 파일의 `NEXT_PUBLIC_BLA_TOKEN`에 추가

### 6. 토큰 받기 (Faucet)
1. 배포된 컨트랙트에서 `mintToSelf` 함수 사용
2. 또는 다른 지갑에 토큰 전송

## Hardhat을 사용한 배포 (고급)

```bash
# Hardhat 프로젝트 초기화
npx hardhat init

# 컨트랙트 파일 복사
# contracts/MockERC20.sol

# 배포 스크립트 작성
# scripts/deploy.js

# 배포
npx hardhat run scripts/deploy.js --network baseSepolia
```

## 여러 토큰 배포

BLA, HUNT, USDC 테스트 토큰을 각각 배포하려면:
1. 각각 다른 이름과 심볼로 배포
2. 배포된 주소를 환경 변수에 추가:
   - `NEXT_PUBLIC_BLA_TOKEN`
   - `NEXT_PUBLIC_HUNT_TOKEN`
   - `NEXT_PUBLIC_USDC_TOKEN` (또는 기존 테스트 토큰 사용)


