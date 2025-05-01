import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GuestService } from './guest.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';
import { Guest } from './guest.entity';

@ApiTags('Guests')
@Controller('guests')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post()
  @Public() // Allow public creation of guest entries
  @ApiOperation({ summary: 'Create a new guest entry' })
  @ApiResponse({
    status: 201,
    description: 'Guest entry created successfully.',
    type: Guest,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (Validation failed or Event ID not found).',
  })
  create(@Body() createGuestDto: CreateGuestDto): Promise<Guest> {
    return this.guestService.create(createGuestDto);
  }

  // Admin routes below
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all guest entries (Admin Only)' })
  @ApiResponse({
    status: 200,
    description: 'Return all guest entries.',
    type: [Guest],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(): Promise<Guest[]> {
    return this.guestService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a guest entry by ID (Admin Only)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the guest entry' })
  @ApiResponse({
    status: 200,
    description: 'Return the guest entry.',
    type: Guest,
  })
  @ApiResponse({ status: 404, description: 'Guest entry not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Guest> {
    return this.guestService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a guest entry (Admin Only)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the guest entry' })
  @ApiResponse({
    status: 200,
    description: 'Guest entry updated successfully.',
    type: Guest,
  })
  @ApiResponse({ status: 404, description: 'Guest entry not found.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (Validation failed or Event ID not found).',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGuestDto: UpdateGuestDto,
  ): Promise<Guest> {
    return this.guestService.update(id, updateGuestDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a guest entry (Admin Only)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the guest entry' })
  @ApiResponse({
    status: 204,
    description: 'Guest entry deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Guest entry not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.guestService.remove(id);
  }
}
