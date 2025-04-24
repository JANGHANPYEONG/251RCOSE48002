import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Web3Auth } from '@web3auth/node-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private web3auth: Web3Auth;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.web3auth = new Web3Auth({
      clientId: this.configService.get<string>('WEB3AUTH_CLIENT_ID'),
      chainId: '0x1', // Ethereum mainnet
    });
  }

  async validateUser(email: string, provider: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email, provider },
    });
    return user;
  }

  async handleSocialLogin(
    email: string,
    name: string,
    provider: string,
    idToken: string,
  ) {
    // Verify token with Web3Auth
    const userInfo = await this.web3auth.getUserInfo(idToken);
    if (!userInfo) {
      throw new UnauthorizedException('Invalid token');
    }

    // Upsert user
    let user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      user = this.userRepository.create({
        email,
        name,
        provider,
        walletAddress: userInfo.walletAddress,
      });
    } else {
      user.walletAddress = userInfo.walletAddress;
    }
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);
    return { ...tokens, user };
  }

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    // TODO: Store refresh token in Redis
    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException();
      }
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    // TODO: Add refresh token to Redis blacklist
    return { message: 'Logged out successfully' };
  }
}
