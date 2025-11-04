import { Body, Controller, Post, Get, Param, UseGuards, Delete } from '@nestjs/common';
import { AssistantService } from '../infrastructure/assistant/assistant.service';
import { ChangeThreadTitleDto, CreateThreadDto, GenerateImageDto, SendMessageDto } from './dtos/create-thread.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DeviceGuard } from './guards/device.guard';


// @UseGuards(JwtAuthGuard, DeviceGuard)
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('thread')
  async createThread(@Body() createThreadDto: CreateThreadDto) {
    return this.assistantService.createThread(createThreadDto);
  }

  @Post('message')
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    return this.assistantService.sendMessage(sendMessageDto);
  }

  @Post('image')
  async generateImage(@Body() generateImageDto: GenerateImageDto) {
    return this.assistantService.generateImage(generateImageDto);
  }

  @Delete('thread')
  async deleteThread(@Param('threadId') threadId: string) {
    return this.assistantService.deleteThread(threadId);
  }

  @Post('thread/title')
  async changeThreadTitle(@Body() changeThreadTitleDto: ChangeThreadTitleDto) {
    return this.assistantService.changeThreadTitle(changeThreadTitleDto.threadId, changeThreadTitleDto.newTitle);
  }

  @Get('threads/:userId')
  async getThreads(@Param('userId') userId: string) {
    return this.assistantService.getUserThreads(userId);
  }
}