import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Public } from './auth.public';
import { Role } from './role.enum';
import { Roles } from './decorator/roles.decorator';
import { UpdateUser2Fa, UpdateUserDto } from 'src/users/dto/update-user.dto';
import { SignUpDto } from './dto/signup.dto';
import { User } from 'src/users/entities/user.entity';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignUpDto) {
    return this.authService.signIn(signInDto);
  }

  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() signUpDto: SignUpDto, @Request() req) {
    const user = req.user;

    return this.authService.register(
      {
        userName: signUpDto.username,
        password: signUpDto.password,
        role: signUpDto.role,
        shopId: signUpDto.shopId,
      },
      user,
    );
  }

  @Roles(Role.Root)
  @HttpCode(HttpStatus.OK)
  @Post('register/system')
  registerSystem(@Body() signUpDto: SignUpDto, @Request() req) {
    const user = req.user;

    return this.authService.register(
      {
        userName: signUpDto.username,
        password: signUpDto.password,
        role: signUpDto.role,
        shopId: signUpDto.shopId,
        systemName: signUpDto.systemName,
        shop: signUpDto.shop,
      },
      user,
    );
  }

  @Roles(Role.Admin, Role.Root)
  @HttpCode(HttpStatus.OK)
  @Post('reset')
  resetPasswrod(@Body() resetDto: SignUpDto, @Req() req) {
    const user = req.user as User;
    return this.authService.resetPassword(
      resetDto.username,
      resetDto.password,
      user,
    );
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    const me = req.user;
    return this.authService.me(me);
  }

  @Patch('me')
  updateProfile(@Request() req, @Body() updateDto: UpdateUserDto) {
    const id = req.user.sub as number;
    return this.authService.update(id, updateDto);
  }

  @Roles(Role.Admin)
  @Get('generate/:id')
  async generateToken(@Param('id') id: string) {
    return await this.authService.generatetoken(+id, true);
  }

  @Post('2fa')
  async enable2fa(@Request() req, @Body() updateDto: UpdateUser2Fa) {
    const id = req.user.id as number;

    if (updateDto.enable) {
      const result =
        await this.authService.generateTwoFactorAuthenticationSecret(id);

      return await this.authService.generateQr(result.otpauthUrl);
    } else {
      return this.authService.removeTwoFactorAuthenticationSecret(id);
    }
  }
}
