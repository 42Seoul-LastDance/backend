import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    // ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
@WebSocketGateway({
    port: 3000,
    cors: {
        origin: true,
        withCredentials: true,
    },
    namespace: 'Game',
}) // 데코레이터 인자로 포트 줄 수 있음
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private gameService: GameService) {}

    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        //TODO jwt check logic
        this.gameService.createPlayer(client);
        console.log('new connection, player enrolled:', client.id);
    }

    async handleDisconnect(client: Socket) {
        await this.gameService.handleDisconnect(client.id);
        this.gameService.deletePlayer(client.id);
        console.log('lost connection, player deleted:', client.id);
    }

    //* Match Game ======================================
    //매칭게임요청 -> 큐 등록 or waitRoom 등록
    @SubscribeMessage('pushQueue')
    pushQueue(client: Socket, clientInfo: JSON) {
        //TESTCODE
        console.log('pushQueue:', client.id);
        this.gameService.pushQueue(
            client.id,
            +clientInfo['gameMode'],
            +clientInfo['userId'],
        );
    }

    //큐에 있던 플레이어 나감
    @SubscribeMessage('popQueue')
    popQueue(client: Socket) {
        //TESTCODE
        console.log('popQueue:', client.id);
        this.gameService.popQueue(client.id);
    }

    //* Friend Game ======================================
    @SubscribeMessage('inviteGame')
    inviteGame(client: Socket, gameInfo: JSON) {
        this.gameService.inviteGame(
            client.id,
            +gameInfo['gameMode'],
            +gameInfo['userId'],
            +gameInfo['friendId'],
        );
    }

    @SubscribeMessage('agreeInvite')
    agreeInvite(client: Socket, gameInfo: JSON) {
        this.gameService.agreeInvite(
            client.id,
            +gameInfo['userId'],
            +gameInfo['friendId'],
        );
    }

    @SubscribeMessage('denyInvite')
    denyInvite(client: Socket, gameInfo: JSON) {
        this.gameService.denyInvite(
            client.id,
            +gameInfo['userId'],
            +gameInfo['friendId'],
        );
    }

    //* Game Room ======================================
    @SubscribeMessage('getReady')
    getReady(client: Socket) {
        //TESTCODE
        console.log('getReady:', client.id);
        this.gameService.getReady(client.id);
    }

    //* In Game ======================================
    //패들 움직임, 상대에게 패들위치 전달
    @SubscribeMessage('movePaddle')
    movePaddle(client: Socket, gameInfo: JSON) {
        this.gameService.movePaddle(client.id, gameInfo);
    }

    //validCheck
    @SubscribeMessage('validCheck')
    async validCheck(client: Socket, gameInfo: JSON) {
        //TESTCODE
        console.log('validCheck:', client.id);
        await this.gameService.validCheck(client.id, gameInfo);
    }

    //ballHit
    @SubscribeMessage('ballHit')
    async ballHit(client: Socket, gameInfo: JSON) {
        //TESTCODE
        // console.log('ballHit:', client.id);
        await this.gameService.ballHit(client.id, gameInfo);
    }

    //emoji send
    @SubscribeMessage('sendEmoji')
    sendEmoji(client: Socket, emoji: string) {
        this.gameService.sendEmoji(client.id, emoji['type']);
    }
}
