import {
  Controller,
  Get,
  Req,
  UseGuards, // Use guards decorator if not global
  Param,
  ParseIntPipe,
  Delete,
  Put,
  Body,
  NotFoundException,
  ForbiddenException, // For role checks
  Post, // For admin creation
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { User, UserRole } from './user.entity';
import { ProfileDTO } from './dto/profile.dto';
import { Roles } from '../auth/decorators/roles.decorator'; // Import Roles decorator
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users') // Group in Swagger
@ApiBearerAuth('access-token') // Indicate JWT is needed for these endpoints
@Controller('users') // Changed from 'user' to 'users' for REST convention
export class UserController {
  constructor(private userService: UserService) {}

  // --- Get Own Profile ---
  @Get('profile')
  @ApiOperation({ summary: "Get logged-in user's profile" })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
    type: ProfileDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(
    @Req() request: { user: JwtPayloadDto },
  ): Promise<ProfileDTO> {
    // AuthGuard already verified the token and attached the user payload
    const userId = request.user.sub;
    const user = await this.userService.findOneById(userId);
    if (!user) {
      // Should not happen if token is valid, but good practice
      throw new NotFoundException('User not found');
    }
    // Map to ProfileDTO (excluding password hash)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  // --- Update Own Profile ---
  @Put('profile')
  @ApiOperation({ summary: "Update logged-in user's profile (name, password)" })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully.',
    type: ProfileDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation failed).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 409, description: 'Conflict (Email already exists).' })
  async updateProfile(
    @Req() request: { user: JwtPayloadDto },
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ProfileDTO> {
    const userId = request.user.sub;
    // Ensure users cannot update their own role via this endpoint
    if (updateUserDto.role) {
      throw new ForbiddenException(
        'Cannot update own role via profile endpoint.',
      );
    }
    const updatedUser = await this.userService.update(
      userId,
      updateUserDto,
      request.user.role,
    ); // Pass role for checks in service
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
    };
  }

  // --- Admin Routes ---

  @Get()
  @Roles(UserRole.ADMIN) // Only Admins can access this
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of users.',
    type: [ProfileDTO],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (User is not an Admin).',
  })
  async findAll(): Promise<ProfileDTO[]> {
    const users = await this.userService.findAll();
    // Map to ProfileDTO array
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: ProfileDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation failed).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Conflict (Email already exists).' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<ProfileDTO> {
    const newUser = await this.userService.create(createUserDto);
    return {
      // Return ProfileDTO shape
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a user by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the user to retrieve',
  })
  @ApiResponse({ status: 200, description: 'User details.', type: ProfileDTO })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProfileDTO> {
    const user = await this.userService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a user by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the user to update',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    type: ProfileDTO,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation failed).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Conflict (Email already exists).' })
  async updateUser(
    @Req() request: { user: JwtPayloadDto }, // Need requesting user's role
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ProfileDTO> {
    const updatedUser = await this.userService.update(
      id,
      updateUserDto,
      request.user.role,
    ); // Pass Admin role
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT) // Standard for successful DELETE
  @ApiOperation({ summary: 'Delete a user by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the user to delete',
  })
  @ApiResponse({ status: 204, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userService.remove(id);
  }
}
