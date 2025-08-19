import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { CourtService } from './court.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { User } from 'src/users/entities/user.entity';
import { PageOptionsDto } from 'src/core/dtos';
import { Public } from 'src/auth/auth.public';
import { QsFindOneCourtDto } from './dto/qs-find-one.dto';

@Controller('court')
export class CourtController {
  constructor(private readonly courtService: CourtService) {}

  @Post()
  create(@Body() createCourtDto: CreateCourtDto, @Req() req) {
    const user = req.user as User;
    return this.courtService.create(createCourtDto, user);
  }

  @Get()
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.courtService.findAll(pageOptionsDto);
  }

  @Public()
  @Get('/public')
  findAllPublic(@Query() pageOptionsDto: PageOptionsDto) {
    return this.courtService.findAll(pageOptionsDto, true);
  }

  @Public()
  @Get('/public/:id')
  findOnePublic(@Param('id') id: string, @Query() qs: QsFindOneCourtDto) {
    return this.courtService.findOneWithBusy(+id, qs);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourtDto: UpdateCourtDto) {
    return this.courtService.update(+id, updateCourtDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courtService.remove(+id);
  }
}
