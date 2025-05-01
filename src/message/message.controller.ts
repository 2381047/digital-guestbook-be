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
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
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
import { Message } from './message.entity';

@ApiTags('Messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @Public() // Allow public creation of messages
  @ApiOperation({ summary: 'Create a new message entry' })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully.',
    type: Message,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (Validation failed or Guest/Event ID not found).',
  })
  create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    return this.messageService.create(createMessageDto);
  }

  // Admin routes below
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all messages (Admin Only)' })
  @ApiResponse({
    status: 200,
    description: 'Return all messages.',
    type: [Message],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(): Promise<Message[]> {
    return this.messageService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a message by ID (Admin Only)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the message' })
  @ApiResponse({
    status: 200,
    description: 'Return the message.',
    type: Message,
  })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Message> {
    return this.messageService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a message (Admin Only)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the message' })
  @ApiResponse({
    status: 200,
    description: 'Message updated successfully.',
    type: Message,
  })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    return this.messageService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a message (Admin Only)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the message' })
  @ApiResponse({ status: 204, description: 'Message deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.messageService.remove(id);
  }
}
