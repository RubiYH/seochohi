## [백엔드]

> - ## [Node.js](https://nodejs.org/en)
>   백엔드 서버를 구현하는 자바스크립트 런타임
> - ## [Express](https://expressjs.com/ko)
>   Node.js용 웹 프레임워크
>   REST API 서버 구현
> - ## MySQL
>   유저 개인정보, 반 시간표, 로그인 세션, 게시글 등 여러 데이터를 관리하는 데이터베이스
>   [Node.js와 연동](https://github.com/sidorares/node-mysql2)하여 백엔드 서버와 통신

- 기타 사용된 주요 라이브러리

> - ## [JSON Web Token(JWT)](https://github.com/auth0/node-jsonwebtoken)
>   토큰 인증 기반의 로그인 시스템 구현
>   세션 시스템과 결합하여 사용자 인증 및 새로운 환경에서의 로그인 차단
> - ## [CORS](https://expressjs.com/en/resources/middleware/cors.html)
>   CORS(교차 출처 리소스 공유) 핸들링
> - ## [Crypto](https://nodejs.org/api/crypto.html), [crypto-js](https://github.com/brix/crypto-js)
>   비밀번호 암호화 및 세션 토큰 생성
>   [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) 알고리즘을 이용하여 비밀번호 암호화
> - ## [Helmet](https://helmetjs.github.io)
>   xss 필터링, 클릭재킹 차단, HSTS 설정 등을 통해 보안 강화
> - ## [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
>   API 반복 요청 횟수 제한을 통해 Dos 공격 예방
> - ## [Nodemailer](https://nodemailer.com/about)
>   메일로 인증 번호 전송 자동화
> - ## [Glob](https://github.com/isaacs/node-glob)
>   분산된 코드 파일 자동 import 및 기출문제 PDF 파일 필터링 기능 구현
