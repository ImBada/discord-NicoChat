Make a Discord channel for a Nico-style chat page.

# 어캐쓰나요
0. node 까세요 https://nodejs.org/
1. 여기서 봇 만드세요 (아무 설정 필요없이 그냥 만들기만 하면 됨) -> https://discord.com/developers/applications
2. SETTINGS -> Installation -> Install Contexts에 Guild Install 체크
3. 동일 페이지에서 바로 아래 있는 Isntall Link에 Discord Provided Link를 들어가서 원하는 서버에 봇 넣기
4. 토큰 모르면 봇 설정 페이지의 Bot에 가서 TOKEN을 받으세요. (걍 리셋하고 복사하면 됨)
5. 소스코드 있는 경로에 .env 파일을 만들어서 텍스트 에디터로 여세요. (VS Code 쓰면 편함)
6. 아래 내용 넣으세요.

```
  VITE_DISCORD_TOKEN=아까 복사한 토큰
  VITE_CHANNEL_ID=원하는채널ID (디스코드 설정->고급->개발자모드 켜면 채널에 우클릭했을 때 ID 복사 가능)
```

8. 소스코드 경로에서 터미널 열고 npm install
9. 개발 이런 거 잘 모르면 그냥 npm run dev로 서버 실행 가능
10. 터미널에 안내되는 주소를 obs 등에 넣어 이용 (ndi로 출력 등)
