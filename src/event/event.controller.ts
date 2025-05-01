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
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';
import { Event } from './event.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @Roles(UserRole.ADMIN) // Only admins can create events
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new event (Admin Only)' })
  @ApiResponse({
    status: 201,
    description: 'The event has been successfully created.',
    type: Event,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    return this.eventService.create(createEventDto);
  }

  @Get()
  @Public() // Events list can be public for dropdowns
  @ApiOperation({ summary: 'Get all events' })
  @ApiResponse({
    status: 200,
    description: 'Return all events.',
    type: [Event],
  })
  findAll(): Promise<Event[]> {
    return this.eventService.findAll();
  }

  @Get(':id')
  @Public() // Single event details can be public
  @ApiOperation({ summary: 'Get an event by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the event to retrieve',
  })
  @ApiResponse({ status: 200, description: 'Return the event.', type: Event })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Event> {
    return this.eventService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN) // Only admins can update events
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update an event (Admin Only)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the event to update',
  })
  @ApiResponse({
    status: 200,
    description: 'The event has been successfully updated.',
    type: Event,
  })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN) // Only admins can delete events
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an event (Admin Only)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the event to delete',
  })
  @ApiResponse({
    status: 204,
    description: 'The event has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.eventService.remove(id);
  }
}
