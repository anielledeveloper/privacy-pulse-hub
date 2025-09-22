import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { DisclaimersService } from './disclaimers.service';
import { 
  CreateDisclaimerDto, 
  UpdateDisclaimerDto, 
  DisclaimerResponseDto,
  ValidateDisclaimerDto,
  ValidateDisclaimerResponseDto
} from './dto/disclaimer.dto';

@Controller('disclaimers')
export class DisclaimersController {
  constructor(private readonly disclaimersService: DisclaimersService) {}

  @Post()
  async createDisclaimer(@Body() createDisclaimerDto: CreateDisclaimerDto): Promise<DisclaimerResponseDto> {
    return this.disclaimersService.createDisclaimer(createDisclaimerDto);
  }

  @Get()
  async getAllDisclaimers(): Promise<DisclaimerResponseDto[]> {
    return this.disclaimersService.getAllDisclaimers();
  }

  @Get('active')
  async getActiveDisclaimer(): Promise<DisclaimerResponseDto> {
    return this.disclaimersService.getActiveDisclaimer();
  }

  @Get(':id')
  async getDisclaimer(@Param('id', ParseIntPipe) id: number): Promise<DisclaimerResponseDto> {
    return this.disclaimersService.getDisclaimer(id);
  }

  @Put(':id')
  async updateDisclaimer(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDisclaimerDto: UpdateDisclaimerDto,
  ): Promise<DisclaimerResponseDto> {
    return this.disclaimersService.updateDisclaimer(id, updateDisclaimerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateDisclaimer(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.disclaimersService.deactivateDisclaimer(id);
  }

  @Post('validate')
  async validateDisclaimer(@Body() validateDto: ValidateDisclaimerDto): Promise<ValidateDisclaimerResponseDto> {
    try {
      const result = await this.disclaimersService.validateDisclaimerVersion(
        validateDto.version,
        validateDto.disclaimerText
      );
      
      if (result.isValid) {
        return { isValid: true, disclaimer: result.disclaimer };
      } else {
        return { 
          isValid: false, 
          error: 'Disclaimer text does not match the expected hash for this version' 
        };
      }
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Validation failed' 
      };
    }
  }
}
