import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator'; // Import Public decorator

@ApiTags('Authentication') // Group endpoints under 'Authentication' in Swagger
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // Mark this route as public (no JWT required)
  @HttpCode(HttpStatus.OK) // Set default success status to 200 OK
  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token.',
    type: Object,
  }) // Improve type later
  @ApiResponse({
    status: 401,
    description: 'Unauthorized (Invalid credentials).',
  })
  signIn(@Body() signInDto: LoginDTO): Promise<{ access_token: string }> {
    return this.authService.signIn(signInDto);
  }

  @Public() // Mark this route as public
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
    type: Object,
  }) // Improve type later
  @ApiResponse({ status: 400, description: 'Bad Request (Validation failed).' })
  @ApiResponse({ status: 409, description: 'Conflict (Email already exists).' })
  register(@Body() registerDto: RegisterDTO) {
    // Return the created user object (without password hash)
    return this.authService.register(registerDto);
  }
}
