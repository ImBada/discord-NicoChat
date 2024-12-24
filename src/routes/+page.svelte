<script>
  import { onMount } from "svelte";
  import { source } from "sveltekit-sse";

  let cap = $state(9999); // 메시지 길이 제한
  let cmd = $state(false); // 명령어 차단 여부
  let clr = $state("#fff"); // 메시지 기본 색상

  let messages = $state([]);

  onMount(() => {
    const messageSource = source("/sse").select("chatMessage");

    messageSource.subscribe((event) => {
      if (!event) {
        console.log("SSE connected");
        return;
      }

      const data = JSON.parse(event);

      const text = data.content;
      const stickers = data.stickers || [];

      // 스티커가 포함된 메시지인지 확인
      let parsedContent;
      if (stickers.length > 0) {
        parsedContent = stickers
          .map(
            (sticker) =>
              `<img src="https://cdn.discordapp.com/stickers/${sticker}.png" class="sticker" />`
          )
          .join(" ");
      } else {
        parsedContent = parseCustomEmojis(text);
      }

      // 명령어 및 메시지 길이 제한 필터
      if (cmd && text.startsWith("!")) return;
      if (text.length > cap) return;

      const message = {
        id: data.id,
        content: parsedContent,
        speed: calcSpeed(text.length),
        top: Math.floor(Math.random() * 80) + "vh",
        color: clr,
      };

      messages = [...messages, message];
    });
  });

  // 속도 계산 (메시지 길이에 따라)
  function calcSpeed(length) {
    return `${10 - length / 50}s`;
  }

  function parseCustomEmojis(text) {
    return text.replace(/<(.?):(\w+):(\d+)>/g, (match, animated, name, id) => {
      return `<img src="https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}" alt="${name}" class="emote" />`;
    });
  }

  function handleAnimationEnd(id) {
    messages = messages.filter((m) => m.id !== id);
  }
</script>

<div class="message-container">
  {#each messages as message (message.id)}
    <div
      class="message"
      data-id={message.id}
      onanimationend={() => handleAnimationEnd(message.id)}
      style="color: {message.color}; top: {message.top}; animation-duration: {message.speed};"
    >
      {@html message.content}
    </div>
  {/each}
</div>

<style>
  @import url(http://fonts.googleapis.com/earlyaccess/notosanskr.css);

  /* 전체 메시지 컨테이너 */
  .message-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    pointer-events: none;
    z-index: 1000;
  }

  /* 개별 메시지 스타일 */
  .message {
    font-family: "Noto Sans KR";
    position: absolute;
    left: 0;
    white-space: nowrap;
    font-size: 64px;
    font-weight: bold;
    color: white;
    text-shadow:
      -2px -2px 0 #000,
      2px -2px 0 #000,
      -2px 2px 0 #000,
      2px 2px 0 #000;
    animation: scroll linear forwards;
  }

  :global(.sticker) {
    max-width: 120px;
    max-height: 120px;
  }

  :global(.emote) {
    max-width: 56px;
    max-height: 56px;
  }

  /* 오른쪽에서 왼쪽으로 흐르는 애니메이션 */
  @keyframes scroll {
    from {
      transform: translateX(100vw);
    }
    to {
      transform: translateX(-100%);
    }
  }
</style>
