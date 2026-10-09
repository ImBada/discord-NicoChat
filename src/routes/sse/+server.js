import { Client, GatewayIntentBits } from 'discord.js';
import { produce } from 'sveltekit-sse';
import { env } from '$env/dynamic/private';

const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

let clients = [];

discordClient.once('ready', () => {
    console.log(`Logged in as ${discordClient.user.tag}`);
});

// 로그인 실패(토큰 오류, 일시적 네트워크 장애 등)가 처리되지 않으면 서버 프로세스 전체가 죽음
Promise.resolve()
    .then(() => discordClient.login(env.DISCORD_TOKEN))
    .catch((error) => console.error('Discord login failed:', error));

discordClient.on('messageCreate', (message) => {
    if (!message.author.bot && message.channel.id === env.CHANNEL_ID) {
        console.log(`New message: ${message.content}`);

        const payload = JSON.stringify({
            content: message.content,
            stickers: message.stickers?.map((x) => x.id) || [],
            id: message.id, //이게 있어야 고유 메시지 처리돼서 subscribe가 동일한 메시지라도 갱신할 수 있음.
        });

        clients.forEach((client) => {
            const { error } = client.emit('chatMessage', payload);
            if (error) {
                console.log(`Error sending message to client ${client.id}`);
            }
        });
    }
});

export const POST = async () => {
    return produce(async function start ({ emit }){
        const clientId = Math.random().toString(36).substring(2);
        clients.push({id: clientId, emit });
        console.log(`Client connected: ${clientId}`);

        // 첫 채팅 또는 30초 주기의 ping까지 응답 시작이 대기할 수 있으므로,
        // 채팅이 없는 경우에도 응답이 즉시 시작되도록 초기 ping을 보냄
        emit('ping', '');

        // 클라이언트가 죽은 연결을 감지할 수 있도록 주기적으로 heartbeat 전송
        // (기본 ping은 data가 항상 ''라 store 값이 안 바뀌어서 클라이언트에서 감지 불가)
        const heartbeat = setInterval(() => {
            emit('heartbeat', String(Date.now()));
        }, 15_000);

        return () => {
            clearInterval(heartbeat);
            console.log(`Client disconnected: ${clientId}`);
            clients = clients.filter((client) => client.id !== clientId);
        };
    })
};
