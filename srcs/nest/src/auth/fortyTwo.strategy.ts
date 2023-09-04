import { Header, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { User } from 'src/user/user.entity';
import { catchError, firstValueFrom } from 'rxjs';
import axios, { AxiosError } from 'axios';
import { error } from 'console';
import { UserInfoDto } from 'src/user/dto/user-info.dto';
import { userRole } from 'src/user/user-role.enum';

//42 OAuth2 인증을 위한 클래스
/*
1. 사용자가 인증을 위해 42서비스로 리다이렉트 된다. 42 서비스에서 로그인 하고 권한을 부여받게 된다.
2. 사용자가 권한을 부여하면 42 서비스는 엑세스코드를 생성하고, 이 코드를 callback url로 전송한다.
3. PassportStrategy 클래스는 전달받은 엑세코드를 사용하여 엑세스 토큰을 요청하고, 42 서비스로부터 엑세스 토큰을 받아온다.
4. validate 메서드가 호출되고, 이떄 전달된 엑세스 토큰과 리프레시 토큰을 사용해서 인증 검증 로직을 수행한다.
45. validate 메서드에서는 인증 검증 후에 엑세스 토큰을 반환한다.
*/
interface UserInfo {
  id: number;
  login: string;
  email: string;
  image: {};
  // 필요한 다른 필드들도 추가
}

@Injectable()
export class FortytwoStrategy extends PassportStrategy(Strategy, 'fortytwo') {
  //PassportStrategy 의 전략을 초기화하고 설정.
  constructor(configService: ConfigService, httpService: HttpService) {
    super({
      authorizationURL: `https://api.intra.42.fr/oauth/authorize?client_id=${configService.get<string>(
        'ft.client_id',
      )}&redirect_uri=${configService.get<string>(
        'ft.callback',
      )}&response_type=code`,
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: configService.get<string>('ft.client_id'),
      clientSecret: configService.get<string>('ft.client_secret'),
      callbackURL: configService.get<string>('ft.callback'),
    });
  }

  //인증이 성공한 후 호출된다.
  async validate(accessToken: string, refreshToken: string): Promise<any> {
    console.log('valdation 함수 호출');
    try {
      const headersRequest = new Headers();
      // https://api.intra.42.fr/oauth/token/info -> 발급 받은 토큰 정보
      //https://api.intra.42.fr/v2/me -> 인증된 사용자의 정보

      const userResponse = await axios.get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: 'Bearer' + ' ' + accessToken,
        },
      });

      const desiredFields = {
        id: userResponse.data.id,
        login: userResponse.data.login,
        email: userResponse.data.email,
        profileUrl: userResponse.data.image.link,
      };
      console.log(desiredFields);

      //slack email로 조회 후 있는 유저라면 token  재발급
      //없는 유저라면 저장 후 token 발급

      //token 반환

      //acccess Token 이 있는 경우, 재발급해서 반환하는 로직 실행( 더 상위의 Guard)?
      //없는 경우가 이 Guard에 들어왔다고 치고 정보 요청 api.
      //DB에 정보 저장 후 accessToken 반환.

      return accessToken;
    } catch (error) {
      console.log(error);
    }
  }
}