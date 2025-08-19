import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import * as qr from 'qrcode';
import { Role } from './role.enum';
import { UsersService } from 'src/users/users.service';
import { AuthResult } from 'src/core/interfaces/auth-result';
import { authenticator } from 'otplib';
import { SignUpDto } from './dto/signup.dto';
import { SystemService } from 'src/system/system.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private systemService: SystemService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async signIn({
    username,
    password: pass,
    authCode,
  }: SignUpDto): Promise<AuthResult> {
    this.logger.log('SIGN IN');
    const justCreated = await this.notExistWillCreateOne(username, pass);

    if (justCreated) {
      return justCreated;
    }

    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Invalid Username/Password');
    }

    if (user.twoFactorAuthenticationSecret && !authCode) {
      throw new ForbiddenException('Invalid FA CODE');
    }

    if (
      authCode &&
      !this.usersService.isTwoFactorAuthenticationCodeValid(
        authCode,
        user.twoFactorAuthenticationSecret,
      )
    ) {
      throw new ForbiddenException('Invalid FA CODE 2');
    }

    if (user.blockedAt) {
      throw new UnauthorizedException('Your account is banned from the system');
    }

    const { password: hash, id, userName, role } = user;

    const isMatch = await bcrypt.compare(pass, hash);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid Username/Password');
    }

    const payload = { sub: id, username: userName, role: role };

    this.logger.debug(payload);

    return {
      accessToken: await this.jwtService.signAsync(payload),
      justCreated: false,
      id: payload.sub,
    };
  }

  async register(
    createDto: CreateUserDto,
    createBy?: User,
  ): Promise<AuthResult> {
    if (createBy && createBy.role === Role.Admin && !createDto.shopId) {
      throw new BadRequestException('shop is required');
    }

    const password = await this.hashPassword(createDto.password);

    const user = await this.usersService.create(
      {
        ...createDto,
        password,
      },
      createBy,
    );

    const payload = {
      sub: user.id,
      username: user.userName,
      role: createDto.role,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      justCreated: true,
      id: payload.sub,
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async resetPassword(
    username: string,
    pass: string,
    reqUser: User,
  ): Promise<User> {
    if (reqUser.role === Role.Root) {
      const password = await this.hashPassword(pass);

      const user = await this.usersService.updateByUserName(username, password);
      return user;
    }

    const userUpdate = await this.usersService.findOneByUsername(username);

    if (userUpdate.system.id !== reqUser.system.id) {
      throw new BadRequestException('Invalid Username');
    }

    const password = await this.hashPassword(pass);
    const user = await this.usersService.updateByUserName(username, password);
    return user;
  }

  async generatetoken(id: number, isForever?: boolean): Promise<any> {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new UnauthorizedException();
    }

    const { userName } = user;

    const payload = { sub: id, username: userName, role: Role.Admin };

    // expired in 1 minutes or forever
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: isForever === true ? '10000d' : '60s',
    });

    const qrCode = await this.generateQr(token);
    return {
      accessToken: token,
      qrCode,
      id,
    };
  }

  async me({ id }: User): Promise<User | undefined> {
    const user = await this.usersService.findOne(id);

    if (!user) {
      return undefined;
    }

    user.password = '';
    return user;
  }

  async update(id: number, updateDto: UpdateUserDto): Promise<User> {
    return await this.usersService.update(id, updateDto);
  }

  async generateQr(value: string): Promise<string> {
    return await qr.toDataURL(value);
  }

  async notExistWillCreateOne(
    username: string,
    pass: string,
  ): Promise<AuthResult> {
    // check for user have one in db
    const exist = await this.usersService.isUserExist();

    if (!exist) {
      return this.register(
        {
          userName: username,
          password: pass,
          role: Role.Root,
        },
        undefined,
      );
    }
  }

  async generateTwoFactorAuthenticationSecret(id: number) {
    const user = await this.usersService.findOne(id);
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(user.userName, 'MONOKOR', secret);

    await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);

    return {
      secret,
      otpauthUrl,
    };
  }

  async removeTwoFactorAuthenticationSecret(id: number) {
    return await this.usersService.removeTwoFactorAuthenticationSecret(id);
  }

  async generateAuthToken(id: number): Promise<string> {
    const user = await this.usersService.findOne(id);
    const token = authenticator.generate(user.twoFactorAuthenticationSecret);
    return token;
  }
}
