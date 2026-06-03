import { Body, Controller, Post, UseGuards, Res, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    this.setRefreshTokenCookie(res, result.tokens.refreshToken);
    return { user: result.user, accessToken: result.tokens.accessToken };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setRefreshTokenCookie(res, result.tokens.refreshToken);
    return { user: result.user, accessToken: result.tokens.accessToken };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = this.getCookie(req, 'refresh_token');
    const result = await this.authService.refresh(refreshToken);
    this.setRefreshTokenCookie(res, result.tokens.refreshToken);
    return { accessToken: result.tokens.accessToken };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return { message: 'Logged out successfully' };
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    const refreshTtl = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTtl,
      path: '/',
    });
  }

  private getCookie(req: Request, name: string) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      return undefined;
    }

    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    const target = cookies.find((cookie) => cookie.startsWith(`${name}=`));
    return target ? decodeURIComponent(target.slice(name.length + 1)) : undefined;
  }
}
